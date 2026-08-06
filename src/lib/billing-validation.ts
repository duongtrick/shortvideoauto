import { z } from "zod";

export const createBankPaymentInput = z.object({
  amount: z.number().int().min(10000).max(50000000).optional(),
  credits: z.number().int().min(1).max(100000).optional(),
  planKey: z.string().min(2).max(40).optional()
}).superRefine((value, context) => {
  const hasPack = value.amount !== undefined && value.credits !== undefined && !value.planKey;
  const hasPlan = value.planKey !== undefined && value.amount === undefined && value.credits === undefined;
  if (!hasPack && !hasPlan) {
    context.addIssue({ code: "custom", message: "Use amount+credits or planKey." });
  }
});
