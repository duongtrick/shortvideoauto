import { z } from "zod";

export const seriesInput = z.object({
  name: z.string().trim().min(2).max(120),
  niche: z.string().trim().min(2).max(120),
  cadence: z.enum(["three_per_week", "daily", "twice_daily"]),
  language: z.string().trim().min(2).max(20).default("vi-VN"),
  platformTargets: z.array(z.enum(["tiktok", "youtube_shorts", "instagram_reels", "facebook_reels"])).min(1),
  templateKey: z.string().trim().max(80).optional(),
  voice: z.string().trim().max(80).optional(),
  defaultCta: z.string().trim().max(160).optional()
});

export const adminSeriesInput = seriesInput.extend({
  userEmail: z.string().trim().email().max(255)
});

export const adminSeriesPatch = seriesInput.partial().extend({
  isActive: z.boolean().optional()
});
