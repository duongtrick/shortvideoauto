import { z } from "zod";

export const queuedJobAlertInput = z.object({
  olderThanMinutes: z.coerce.number().int().min(5).max(1440).default(30),
  take: z.coerce.number().int().min(1).max(100).default(50)
});
