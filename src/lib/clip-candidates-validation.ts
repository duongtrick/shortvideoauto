import { z } from "zod";

export const clipCandidatesInput = z
  .object({
    sourceUrl: z.string().url().max(2048).optional(),
    transcript: z.string().trim().min(40).max(20000).optional(),
    targetSeconds: z.coerce.number().int().min(15).max(90).default(35),
    maxClips: z.coerce.number().int().min(1).max(10).default(5)
  })
  .refine((input) => input.sourceUrl || input.transcript, {
    message: "sourceUrl or transcript is required."
  });
