import { z } from "zod";

export const emailTemplateKey = z.enum([
  "render.completed",
  "render.failed",
  "billing.payment_pending",
  "billing.payment_confirmed",
  "auth.welcome",
  "auth.email_verification",
  "auth.password_reset",
  "auth.password_changed"
]);

export const emailTemplatePatch = z.object({
  key: emailTemplateKey,
  subject: z.string().trim().min(2).max(160),
  bodyText: z.string().trim().min(10).max(5000)
});

export const emailTemplateTestInput = z.object({
  key: emailTemplateKey,
  toEmail: z.string().email().max(255).optional()
});
