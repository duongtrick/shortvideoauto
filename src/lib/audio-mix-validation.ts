import { z } from "zod";

export const musicDuckingPreset = z.enum(["soft", "normal", "aggressive"]);

export const audioMixInput = z.object({
  voicePath: z.string().trim().min(1).max(500),
  musicPath: z.string().trim().min(1).max(500),
  outputPath: z.string().trim().min(1).max(500),
  preset: musicDuckingPreset.default("normal"),
  musicVolume: z.number().min(0).max(1).default(0.45)
});
