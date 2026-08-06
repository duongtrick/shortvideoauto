import type { PrismaClient } from "@prisma/client";

type Db = PrismaClient | Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

export function getPlanDurationDays(provider: string) {
  const durationDays = Number(provider.split(":")[2] ?? 30);
  return Number.isFinite(durationDays) && durationDays > 0 ? durationDays : 30;
}

export function addSubscriptionDays(now: Date, durationDays: number) {
  const currentPeriodEnd = new Date(now);
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + durationDays);
  return currentPeriodEnd;
}

export async function activatePendingSubscriptionForPayment(
  db: Db,
  input: { paymentCode: string; now?: Date }
) {
  const subscription = await db.subscription.findUnique({ where: { providerId: input.paymentCode } });
  if (subscription?.status !== "pending") return null;

  return db.subscription.update({
    where: { id: subscription.id },
    data: {
      status: "active",
      currentPeriodEnd: addSubscriptionDays(input.now ?? new Date(), getPlanDurationDays(subscription.provider))
    }
  });
}
