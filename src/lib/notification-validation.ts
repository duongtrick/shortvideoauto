import { z } from "zod";

export const notificationPreferenceInput = z.object({
  emailRenderDone: z.boolean().optional(),
  emailRenderFail: z.boolean().optional(),
  emailBilling: z.boolean().optional(),
  emailSecurity: z.boolean().optional(),
  digestMode: z.boolean().optional(),
  quietHoursStart: z.number().int().min(0).max(23).nullable().optional(),
  quietHoursEnd: z.number().int().min(0).max(23).nullable().optional()
});
