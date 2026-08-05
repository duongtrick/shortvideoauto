import { z } from "zod";

export const scheduledPostInput = z.object({
  videoId: z.string().min(1),
  platform: z.enum(["tiktok", "youtube_shorts", "instagram_reels", "facebook_reels", "x", "linkedin", "pinterest"]),
  title: z.string().trim().max(120).optional(),
  caption: z.string().trim().max(2200).optional(),
  hashtags: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
  scheduledAt: z.string().datetime()
});

export const scheduleQuery = z.object({
  status: z.enum(["draft", "queued", "published", "failed"]).optional(),
  platform: scheduledPostInput.shape.platform.optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  take: z.coerce.number().int().min(1).max(100).default(50)
});

export const scheduleSuggestionInput = z.object({
  videoId: z.string().min(1),
  platform: scheduledPostInput.shape.platform,
  tone: z.enum(["deal", "review", "problem_solution"]).default("deal")
});

export const bestTimeInput = z.object({
  platform: scheduledPostInput.shape.platform,
  timezoneOffsetMinutes: z.number().int().min(-720).max(840).default(420),
  daysAhead: z.coerce.number().int().min(1).max(14).default(7)
});
