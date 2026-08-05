import { z } from "zod";

export const templateMarketplaceQuery = z.object({
  category: z.string().trim().min(1).max(80).optional(),
  platform: z.string().trim().min(1).max(40).optional(),
  search: z.string().trim().min(1).max(80).optional(),
  take: z.coerce.number().int().min(1).max(50).default(24)
});
