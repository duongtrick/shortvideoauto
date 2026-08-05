import { z } from "zod";

export const videoLibraryQuery = z.object({
  status: z.enum(["queued", "scraping", "scripting", "tts", "rendering", "uploading", "completed", "failed"]).optional(),
  templateKey: z.string().trim().min(1).max(80).optional(),
  sourceHost: z.string().trim().min(2).max(120).optional(),
  seriesId: z.string().trim().min(1).max(120).optional(),
  language: z.string().trim().min(2).max(20).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  take: z.coerce.number().int().min(1).max(100).default(30)
});
