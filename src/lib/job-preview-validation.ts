import { z } from "zod";

export const jobPreviewPatch = z.object({
  productTitle: z.string().trim().min(1).max(220).optional(),
  price: z.string().trim().min(1).max(80).optional(),
  imageUrls: z.array(z.string().url().max(2048)).max(12).optional(),
  selectedScriptId: z.string().trim().min(1).max(120).optional(),
  scriptContent: z.string().trim().min(10).max(2200).optional(),
  cta: z.string().trim().min(1).max(160).optional()
});
