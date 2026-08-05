import { z } from "zod";

export const captionSegment = z.object({
  startMs: z.number().int().min(0),
  endMs: z.number().int().min(0),
  text: z.string().trim().min(1).max(300)
});

export const captionExportInput = z.object({
  format: z.enum(["srt", "vtt"]),
  segments: z.array(captionSegment).min(1).max(500)
});
