import { z } from "zod";

export const inspirationPlatform = z.enum([
  "tiktok",
  "shopee_video",
  "youtube_shorts",
  "instagram_reels",
  "facebook_reels",
  "other"
]);

export const inspirationInput = z.object({
  sourceUrl: z.string().url().max(2048),
  platform: inspirationPlatform,
  title: z.string().trim().max(160).optional(),
  hook: z.string().trim().max(220).optional(),
  cta: z.string().trim().max(160).optional(),
  templateKey: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(1000).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([])
});

export const inspirationQuery = z.object({
  platform: inspirationPlatform.optional(),
  templateKey: z.string().trim().min(1).max(80).optional(),
  search: z.string().trim().min(1).max(80).optional(),
  take: z.coerce.number().int().min(1).max(100).default(50)
});
