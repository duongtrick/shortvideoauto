import { z } from "zod";

export const emailTemplateKey = z.enum([
  "render.completed",
  "render.failed",
  "billing.payment_confirmed",
  "auth.welcome",
  "auth.password_reset"
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
