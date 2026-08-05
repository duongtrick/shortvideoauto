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

export const captionPresetKey = z.enum(["clean_bold", "deal_pop", "story_subtle", "karaoke_highlight"]);

export const captionPreviewInput = z.object({
  preset: captionPresetKey.default("clean_bold"),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#ff6b35"),
  fontFamily: z.string().trim().min(2).max(80).default("Inter"),
  segments: z.array(captionSegment).min(1).max(50),
  emphasizeWords: z.array(z.string().trim().min(1).max(40)).max(20).default([])
});
