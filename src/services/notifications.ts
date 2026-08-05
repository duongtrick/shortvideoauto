import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { createSignedDownloadUrl } from "@/services/storage";

type EmailTemplate = {
  subject: string;
  bodyText: string;
};

type EmailEvent = "render.completed" | "render.failed";

export function renderJobCompletedEmail(input: {
  appUrl: string;
  videoTitle: string;
  downloadUrl: string;
  exportUrl: string;
  scheduleUrl: string;
  durationMs: number | null;
}): EmailTemplate {
  const duration = input.durationMs ? `${Math.round(input.durationMs / 1000)}s` : "unknown";

  return {
    subject: `Video da tao xong: ${input.videoTitle}`,
    bodyText: [
      `Video "${input.videoTitle}" da render xong.`,
      `Thoi luong: ${duration}.`,
      `Tai MP4: ${input.downloadUrl}`,
      `Xuat bundle: ${input.exportUrl}`,
      `Len lich dang: ${input.scheduleUrl}`,
      `Mo dashboard: ${input.appUrl}/dashboard`
    ].join("\n")
  };
}

export function renderJobFailedEmail(input: {
  appUrl: string;
  jobId: string;
  errorCode: string;
  refundStatus: "refunded" | "pending";
}): EmailTemplate {
  return {
    subject: `Video tao loi: ${input.jobId}`,
    bodyText: [
      `Job ${input.jobId} tao video bi loi.`,
      `Ma loi: ${input.errorCode}.`,
      `Trang thai hoan credit: ${input.refundStatus}.`,
      `Thu lai trong dashboard: ${input.appUrl}/dashboard?jobId=${encodeURIComponent(input.jobId)}`
    ].join("\n")
  };
}

async function postEmailWebhook(input: { to: string; subject: string; bodyText: string }) {
  if (!env.EMAIL_WEBHOOK_URL) return { status: "skipped", providerId: null };

  const response = await fetch(env.EMAIL_WEBHOOK_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: input.to,
      subject: input.subject,
      text: input.bodyText
    })
  });

  if (!response.ok) {
    throw new Error(`Email webhook failed with ${response.status}`);
  }

  return { status: "sent", providerId: response.headers.get("x-message-id") };
}

async function shouldSendEmail(userId: string, event: EmailEvent) {
  const prefs = await prisma.notificationPreference.findUnique({ where: { userId } });
  if (!prefs) return true;
  if (event === "render.completed") return prefs.emailRenderDone;
  if (event === "render.failed") return prefs.emailRenderFail;
  return true;
}

async function createEmailDelivery(input: {
  userId: string;
  event: EmailEvent;
  toEmail: string;
  template: EmailTemplate;
}) {
  if (!(await shouldSendEmail(input.userId, input.event))) {
    return prisma.emailDelivery.create({
      data: {
        userId: input.userId,
        event: input.event,
        toEmail: input.toEmail,
        subject: input.template.subject,
        bodyText: input.template.bodyText,
        status: "suppressed"
      }
    });
  }

  const delivery = await prisma.emailDelivery.create({
    data: {
      userId: input.userId,
      event: input.event,
      toEmail: input.toEmail,
      subject: input.template.subject,
      bodyText: input.template.bodyText,
      provider: env.EMAIL_WEBHOOK_URL ? "webhook" : null
    }
  });

  try {
    const sent = await postEmailWebhook({
      to: input.toEmail,
      subject: input.template.subject,
      bodyText: input.template.bodyText
    });
    return prisma.emailDelivery.update({
      where: { id: delivery.id },
      data: {
        status: sent.status,
        providerId: sent.providerId,
        sentAt: sent.status === "sent" ? new Date() : null
      }
    });
  } catch (error) {
    return prisma.emailDelivery.update({
      where: { id: delivery.id },
      data: {
        status: "failed",
        retryCount: { increment: 1 },
        lastError: error instanceof Error ? error.message : "Unknown email error"
      }
    });
  }
}

export async function notifyRenderCompleted(input: { userId: string; jobId: string; videoId: string }) {
  const video = await prisma.video.findFirst({
    where: { id: input.videoId, userId: input.userId },
    include: { user: true, job: { include: { productSource: true } } }
  });
  if (!video) return;

  const title = video.job?.productSource?.title ?? `video ${input.videoId}`;
  const exportUrl = `${env.APP_URL}/api/videos/${encodeURIComponent(video.id)}/export`;
  const scheduleUrl = `${env.APP_URL}/dashboard?scheduleVideoId=${encodeURIComponent(video.id)}`;
  const template = renderJobCompletedEmail({
    appUrl: env.APP_URL,
    videoTitle: title,
    durationMs: video.durationMs,
    downloadUrl: createSignedDownloadUrl(video.storageKey, 60 * 60 * 24),
    exportUrl,
    scheduleUrl
  });

  await prisma.inAppNotification.create({
    data: {
      userId: input.userId,
      event: "render.completed",
      title: "Video da tao xong",
      body: title,
      actionUrl: `/dashboard?videoId=${encodeURIComponent(video.id)}`
    }
  });
  await createEmailDelivery({ userId: input.userId, event: "render.completed", toEmail: video.user.email, template });
}

export async function notifyRenderFailed(input: { userId: string; jobId: string; errorCode: string }) {
  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user) return;

  const template = renderJobFailedEmail({
    appUrl: env.APP_URL,
    jobId: input.jobId,
    errorCode: input.errorCode,
    refundStatus: "refunded"
  });

  await prisma.inAppNotification.create({
    data: {
      userId: input.userId,
      event: "render.failed",
      title: "Tao video bi loi",
      body: `Job ${input.jobId} can thu lai.`,
      actionUrl: `/dashboard?jobId=${encodeURIComponent(input.jobId)}`
    }
  });
  await createEmailDelivery({ userId: input.userId, event: "render.failed", toEmail: user.email, template });
}

export async function safeNotifyRenderCompleted(input: { userId: string; jobId: string; videoId: string }) {
  try {
    await notifyRenderCompleted(input);
  } catch (error) {
    logger.error("render_completed_notification_failed", { jobId: input.jobId, error });
  }
}

export async function safeNotifyRenderFailed(input: { userId: string; jobId: string; errorCode: string }) {
  try {
    await notifyRenderFailed(input);
  } catch (error) {
    logger.error("render_failed_notification_failed", { jobId: input.jobId, error });
  }
}
