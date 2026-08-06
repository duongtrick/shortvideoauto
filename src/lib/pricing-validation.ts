import { z } from "zod";

export const pricingCreditPack = z.object({
  key: z.string().min(2).max(40),
  name: z.string().min(2).max(80),
  amount: z.number().int().min(10000).max(50000000),
  credits: z.number().int().min(1).max(100000),
  description: z.string().min(2).max(240)
});

export const pricingSubscriptionPlan = z.object({
  key: z.string().min(2).max(40),
  name: z.string().min(2).max(80),
  price: z.number().int().min(0).max(50000000),
  durationDays: z.number().int().min(1).max(3660),
  credits: z.number().int().min(1).max(1000000),
  description: z.string().min(2).max(240)
});

export const pricingConfigSchema = z.object({
  creditPacks: z.array(pricingCreditPack).min(1).max(12),
  subscriptionPlans: z.array(pricingSubscriptionPlan).min(1).max(12)
});

export type PricingConfig = z.infer<typeof pricingConfigSchema>;
