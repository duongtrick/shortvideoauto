import { z } from "zod";

export const emailWebhookInput = z.object({
  deliveryId: z.string().trim().min(1).max(120).optional(),
  providerId: z.string().trim().min(1).max(255).optional(),
  status: z.enum(["sent", "delivered", "opened", "clicked", "bounced", "complained", "failed"]),
  eventType: z.string().trim().max(80).optional(),
  error: z.string().trim().max(500).optional()
}).refine((input) => input.deliveryId || input.providerId, {
  message: "deliveryId or providerId is required."
});
