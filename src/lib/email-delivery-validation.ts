import { z } from "zod";

export const emailDeliveryQuery = z.object({
  status: z.enum(["pending", "sent", "failed", "skipped", "suppressed"]).optional(),
  event: z.string().trim().min(1).max(80).optional(),
  userId: z.string().trim().min(1).max(120).optional(),
  take: z.coerce.number().int().min(1).max(100).default(50)
});
