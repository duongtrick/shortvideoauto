import { createHash } from "node:crypto";

export function createReferralCode(userId: string) {
  return createHash("sha256").update(`ref:${userId}`).digest("hex").slice(0, 10).toUpperCase();
}

export function calculateCommission(amount: number, rate = 0.3) {
  return Math.max(0, Math.floor(amount * rate));
}
