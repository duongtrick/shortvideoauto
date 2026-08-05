import { z } from "zod";

export const tiktokCalculatorInput = z.object({
  username: z.string().trim().min(2).max(80),
  followers: z.coerce.number().int().min(0).max(1_000_000_000),
  likes: z.coerce.number().int().min(0).max(10_000_000_000),
  avgViews: z.coerce.number().int().min(0).max(1_000_000_000).default(0),
  engagementRate: z.coerce.number().min(0).max(100).optional()
});
