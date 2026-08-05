import { z } from "zod";

export const mediaPreviewQuery = z.object({
  type: z.enum(["voice", "music"]).optional(),
  language: z.string().trim().min(2).max(20).optional()
});
