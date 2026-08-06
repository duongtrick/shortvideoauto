import type { PrismaClient } from "@prisma/client";
import { getSystemSetting, setSystemSetting } from "@/services/system-settings";
import {
  renderJobCompletedEmail,
  renderJobFailedEmail,
  renderEmailVerificationEmail,
  renderPasswordChangedEmail,
  renderPasswordResetEmail,
  renderPaymentConfirmedEmail,
  renderWelcomeEmail,
  type EmailTemplate,
  type EmailEvent
} from "@/services/notifications";

type TemplateOverride = {
  subject: string;
  bodyText: string;
};

const settingPrefix = "email_template.";

export const emailTemplateKeys: EmailEvent[] = [
  "render.completed",
  "render.failed",
  "billing.payment_confirmed",
  "auth.welcome",
  "auth.email_verification",
  "auth.password_reset",
  "auth.password_changed"
];

export function defaultEmailTemplate(key: EmailEvent): EmailTemplate {
  if (key === "render.completed") {
    return renderJobCompletedEmail({
      appUrl: "https://shortvideoauto.local",
      videoTitle: "Deal noi com dien",
      downloadUrl: "https://shortvideoauto.local/api/videos/download?key=sample",
      exportUrl: "https://shortvideoauto.local/api/videos/video_1/export",
      scheduleUrl: "https://shortvideoauto.local/dashboard?scheduleVideoId=video_1",
      durationMs: 30000
    });
  }
  if (key === "render.failed") {
    return renderJobFailedEmail({
      appUrl: "https://shortvideoauto.local",
      jobId: "job_1",
      errorCode: "WORKER_PIPELINE_FAILED",
      refundStatus: "refunded"
    });
  }
  if (key === "billing.payment_confirmed") {
    return renderPaymentConfirmedEmail({
      appUrl: "https://shortvideoauto.local",
      code: "CTF5123456",
      amount: 100000,
      credits: 100
    });
  }
  if (key === "auth.welcome") {
    return renderWelcomeEmail({
      appUrl: "https://shortvideoauto.local",
      name: "Demo User",
      email: "demo@shortvideoauto.local"
    });
  }
  if (key === "auth.email_verification") {
    return renderEmailVerificationEmail({
      appUrl: "https://shortvideoauto.local",
      verifyUrl: "https://shortvideoauto.local/verify-email?token=sample",
      expiresHours: 24
    });
  }
  if (key === "auth.password_changed") {
    return renderPasswordChangedEmail({
      appUrl: "https://shortvideoauto.local"
    });
  }

  return renderPasswordResetEmail({
    appUrl: "https://shortvideoauto.local",
    resetUrl: "https://shortvideoauto.local/reset-password?token=sample",
    expiresMinutes: 30
  });
}

export async function getEmailTemplate(prisma: PrismaClient, key: EmailEvent) {
  const fallback = defaultEmailTemplate(key);
  const override = await getSystemSetting<TemplateOverride | null>(prisma, `${settingPrefix}${key}`, null);
  return {
    key,
    subject: override?.subject ?? fallback.subject,
    bodyText: override?.bodyText ?? fallback.bodyText,
    isCustomized: Boolean(override)
  };
}

export async function listEmailTemplates(prisma: PrismaClient) {
  return Promise.all(emailTemplateKeys.map((key) => getEmailTemplate(prisma, key)));
}

export async function saveEmailTemplate(
  prisma: PrismaClient,
  input: { key: EmailEvent; subject: string; bodyText: string }
) {
  await setSystemSetting(prisma, {
    key: `${settingPrefix}${input.key}`,
    value: { subject: input.subject, bodyText: input.bodyText },
    group: "email_templates"
  });
  return getEmailTemplate(prisma, input.key);
}
