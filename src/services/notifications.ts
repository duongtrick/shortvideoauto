import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { createSignedDownloadUrl } from "@/services/storage";

export type EmailTemplate = {
  subject: string;
  bodyText: string;
};

export type EmailEvent =
  | "render.completed"
  | "render.failed"
  | "billing.payment_confirmed"
  | "auth.welcome"
  | "auth.password_reset"
  | "render.queue_stalled"
  | "admin.test";

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

export function renderPaymentConfirmedEmail(input: {
  appUrl: string;
  code: string;
  amount: number;
  credits: number;
}): EmailTemplate {
  return {
    subject: `Nap credit thanh cong: ${input.code}`,
    bodyText: [
      `Thanh toan ${input.code} da duoc xac nhan.`,
      `So tien: ${input.amount} VND.`,
      `Credit da cong: ${input.credits}.`,
      `Xem billing: ${input.appUrl}/account`
    ].join("\n")
  };
}

export function renderWelcomeEmail(input: { appUrl: string; name: string | null; email: string }): EmailTemplate {
  const displayName = input.name ?? input.email;

  return {
    subject: "Chao mung den ShortVideoAuto",
    bodyText: [
      `Chao ${displayName},`,
      "Tai khoan ShortVideoAuto cua ban da san sang.",
      `Tao video dau tien: ${input.appUrl}/dashboard`
    ].join("\n")
  };
}

export function renderPasswordResetEmail(input: { appUrl: string; resetUrl: string; expiresMinutes: number }): EmailTemplate {
  return {
    subject: "Dat lai mat khau ShortVideoAuto",
    bodyText: [
      "Ban vua yeu cau dat lai mat khau.",
      `Link dat lai mat khau: ${input.resetUrl}`,
      `Link het han sau ${input.expiresMinutes} phut.`,
      `Neu khong phai ban, bo qua email nay: ${input.appUrl}/login`
    ].join("\n")
  };
}

export function renderQueuedTooLongEmail(input: { appUrl: string; jobId: string; queuedMinutes: number }): EmailTemplate {
  return {
    subject: `Job dang cho qua lau: ${input.jobId}`,
    bodyText: [
      `Job ${input.jobId} da o trang thai queued khoang ${input.queuedMinutes} phut.`,
      "He thong can kiem tra worker/Redis hoac thu retry neu can.",
      `Mo dashboard: ${input.appUrl}/dashboard?jobId=${encodeURIComponent(input.jobId)}`
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
  if (prefs.digestMode && !isSecurityEmailEvent(event)) return false;
  if (isWithinQuietHours(new Date().getHours(), prefs.quietHoursStart, prefs.quietHoursEnd) && !isSecurityEmailEvent(event)) {
    return false;
  }
  if (event === "render.completed") return prefs.emailRenderDone;
  if (event === "render.failed") return prefs.emailRenderFail;
  if (event === "billing.payment_confirmed") return prefs.emailBilling;
  if (event === "auth.welcome" || event === "auth.password_reset") return prefs.emailSecurity;
  if (event === "render.queue_stalled") return prefs.emailRenderFail;
  return true;
}

export function isSecurityEmailEvent(event: EmailEvent) {
  return event === "auth.password_reset" || event === "admin.test";
}

export function isWithinQuietHours(hour: number, start: number | null, end: number | null) {
  if (start === null || end === null || start === end) return false;
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end;
}

export async function createEmailDelivery(input: {
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

export async function notifyPaymentConfirmed(input: { paymentId: string }) {
  const payment = await prisma.payment.findUnique({
    where: { id: input.paymentId },
    include: { user: true }
  });
  if (!payment) return;

  const template = renderPaymentConfirmedEmail({
    appUrl: env.APP_URL,
    code: payment.code,
    amount: payment.amount,
    credits: payment.credits
  });

  await prisma.inAppNotification.create({
    data: {
      userId: payment.userId,
      event: "billing.payment_confirmed",
      title: "Nap credit thanh cong",
      body: `${payment.credits} credit da duoc cong.`,
      actionUrl: "/account"
    }
  });
  await createEmailDelivery({
    userId: payment.userId,
    event: "billing.payment_confirmed",
    toEmail: payment.user.email,
    template
  });
}

export async function notifyWelcome(input: { userId: string }) {
  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user) return;

  const template = renderWelcomeEmail({
    appUrl: env.APP_URL,
    name: user.name,
    email: user.email
  });

  await prisma.inAppNotification.create({
    data: {
      userId: user.id,
      event: "auth.welcome",
      title: "Chao mung den ShortVideoAuto",
      body: "Bat dau tao video affiliate dau tien.",
      actionUrl: "/dashboard"
    }
  });
  await createEmailDelivery({ userId: user.id, event: "auth.welcome", toEmail: user.email, template });
}

export async function notifyPasswordResetRequested(input: { userId: string; resetUrl: string; expiresMinutes: number }) {
  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user) return;

  const template = renderPasswordResetEmail({
    appUrl: env.APP_URL,
    resetUrl: input.resetUrl,
    expiresMinutes: input.expiresMinutes
  });

  await createEmailDelivery({ userId: user.id, event: "auth.password_reset", toEmail: user.email, template });
}

export async function alertQueuedTooLongJobs(input: { olderThanMinutes: number; take?: number }) {
  const createdBefore = new Date(Date.now() - input.olderThanMinutes * 60 * 1000);
  const jobs = await prisma.renderJob.findMany({
    where: {
      status: "queued",
      createdAt: { lte: createdBefore }
    },
    take: input.take ?? 50,
    orderBy: { createdAt: "asc" },
    include: { user: true }
  });
  const alerted: string[] = [];

  for (const job of jobs) {
    const actionUrl = `/dashboard?jobId=${encodeURIComponent(job.id)}`;
    const exists = await prisma.inAppNotification.findFirst({
      where: {
        userId: job.userId,
        event: "render.queue_stalled",
        actionUrl
      }
    });
    if (exists) continue;

    const queuedMinutes = Math.max(1, Math.round((Date.now() - job.createdAt.getTime()) / 60000));
    const template = renderQueuedTooLongEmail({
      appUrl: env.APP_URL,
      jobId: job.id,
      queuedMinutes
    });
    await prisma.inAppNotification.create({
      data: {
        userId: job.userId,
        event: "render.queue_stalled",
        title: "Job dang cho qua lau",
        body: `Job ${job.id} dang cho ${queuedMinutes} phut.`,
        actionUrl
      }
    });
    await createEmailDelivery({
      userId: job.userId,
      event: "render.queue_stalled",
      toEmail: job.user.email,
      template
    });
    alerted.push(job.id);
  }

  return alerted;
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

export async function safeNotifyPaymentConfirmed(input: { paymentId: string }) {
  try {
    await notifyPaymentConfirmed(input);
  } catch (error) {
    logger.error("payment_confirmed_notification_failed", { paymentId: input.paymentId, error });
  }
}

export async function safeNotifyWelcome(input: { userId: string }) {
  try {
    await notifyWelcome(input);
  } catch (error) {
    logger.error("welcome_notification_failed", { userId: input.userId, error });
  }
}

export async function safeNotifyPasswordResetRequested(input: { userId: string; resetUrl: string; expiresMinutes: number }) {
  try {
    await notifyPasswordResetRequested(input);
  } catch (error) {
    logger.error("password_reset_notification_failed", { userId: input.userId, error });
  }
}

export async function retryEmailDelivery(deliveryId: string) {
  const delivery = await prisma.emailDelivery.findUnique({ where: { id: deliveryId } });
  if (!delivery) return null;
  if (delivery.status === "sent") return delivery;

  try {
    const sent = await postEmailWebhook({
      to: delivery.toEmail,
      subject: delivery.subject,
      bodyText: delivery.bodyText
    });
    return prisma.emailDelivery.update({
      where: { id: delivery.id },
      data: {
        status: sent.status,
        provider: env.EMAIL_WEBHOOK_URL ? "webhook" : delivery.provider,
        providerId: sent.providerId,
        retryCount: { increment: 1 },
        lastError: null,
        sentAt: sent.status === "sent" ? new Date() : delivery.sentAt
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
