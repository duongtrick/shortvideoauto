import { z } from "zod";

export const adminSubscriptionInput = z.object({
  userEmail: z.string().trim().email().max(255),
  provider: z.string().trim().min(2).max(80),
  providerId: z.string().trim().min(2).max(160),
  status: z.string().trim().min(2).max(80).default("active"),
  currentPeriodEnd: z.string().datetime().optional()
});

export const adminSubscriptionPatch = z.object({
  provider: z.string().trim().min(2).max(80).optional(),
  status: z.string().trim().min(2).max(80).optional(),
  currentPeriodEnd: z.string().datetime().nullable().optional()
});
