import { z } from "zod";

export const adminProviderInput = z.object({
  key: z.string().trim().min(2).max(80),
  name: z.string().trim().min(2).max(120),
  config: z.record(z.string(), z.unknown()).default({}),
  isActive: z.boolean().default(true)
});

export const adminProviderPatch = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional()
});

export const adminProviderTestInput = z.object({
  text: z.string().trim().min(2).max(500).default("Xin chao, day la giong doc thu.")
});
