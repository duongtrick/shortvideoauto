import { z } from "zod";

export const createBankPaymentInput = z.object({
  amount: z.number().int().min(10000).max(50000000),
  credits: z.number().int().min(1).max(100000)
});
