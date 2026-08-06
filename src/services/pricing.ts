import type { PrismaClient } from "@prisma/client";
import { pricingConfigSchema, type PricingConfig } from "@/lib/pricing-validation";
import { getSystemSetting } from "@/services/system-settings";

export const pricingSettingKey = "pricing.config";
export const pricingSettingGroup = "billing";

export const defaultPricingConfig: PricingConfig = {
  creditPacks: [
    { key: "credit_100", name: "100 lượt", amount: 100000, credits: 100, description: "Phù hợp test niche và tạo video lẻ." },
    { key: "credit_330", name: "330 lượt", amount: 300000, credits: 330, description: "Có bonus cho creator chạy đều mỗi tuần." },
    { key: "credit_600", name: "600 lượt", amount: 500000, credits: 600, description: "Tối ưu chi phí cho creator tạo nhiều video." }
  ],
  subscriptionPlans: [
    { key: "starter_monthly", name: "Starter", price: 199000, durationDays: 30, credits: 250, description: "Gói tháng cho creator mới bắt đầu." },
    { key: "creator_monthly", name: "Creator", price: 499000, durationDays: 30, credits: 800, description: "Gói tháng cho affiliate cá nhân chạy hằng ngày." },
    { key: "team_monthly", name: "Team", price: 1499000, durationDays: 30, credits: 3000, description: "Gói tháng cho đội nhiều sản phẩm và nhiều template." }
  ]
};

export async function getPricingConfig(prisma: PrismaClient) {
  try {
    const setting = await getSystemSetting<unknown>(prisma, pricingSettingKey, defaultPricingConfig);
    return pricingConfigSchema.catch(defaultPricingConfig).parse(setting);
  } catch {
    return defaultPricingConfig;
  }
}

export function formatVnd(amount: number) {
  return amount.toLocaleString("vi-VN") + "đ";
}
