import { z } from "zod";

export const emailDeliveryQuery = z.object({
  status: z
    .enum([
      "pending",
      "sent",
      "delivered",
      "opened",
      "clicked",
      "bounced",
      "complained",
      "failed",
      "skipped",
      "suppressed",
      "digest_pending",
      "deferred",
      "digested"
    ])
    .optional(),
  event: z.string().trim().min(1).max(80).optional(),
  userId: z.string().trim().min(1).max(120).optional(),
  take: z.coerce.number().int().min(1).max(100).default(50)
});

export const emailDigestInput = z.object({
  userId: z.string().trim().min(1).max(120).optional(),
  take: z.coerce.number().int().min(1).max(500).default(100)
});
