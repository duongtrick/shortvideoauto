import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createBankPaymentInput } from "@/lib/billing-validation";
import { requireCurrentUser } from "@/services/auth";
import { createBankTransferInstruction, createPaymentCode } from "@/services/bank-payments";
import { writeAuditLog } from "@/services/audit";
import { getPricingConfig } from "@/services/pricing";
import { safeNotifyPaymentPending } from "@/services/notifications";

export async function GET() {
  const user = await requireCurrentUser();
  const [payments, subscriptions] = await Promise.all([
    prisma.payment.findMany({
      where: { userId: user.id },
      take: 20,
      orderBy: { createdAt: "desc" }
    }),
    prisma.subscription.findMany({
      where: { userId: user.id },
      take: 10,
      orderBy: { createdAt: "desc" }
    })
  ]);

  return NextResponse.json({ payments, subscriptions });
}

export async function POST(request: Request) {
  const user = await requireCurrentUser();
  const parsed = createBankPaymentInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payment request." }, { status: 400 });
  const code = createPaymentCode();
  const pricing = await getPricingConfig(prisma);
  const plan = parsed.data.planKey
    ? pricing.subscriptionPlans.find((item) => item.key === parsed.data.planKey)
    : null;
  if (parsed.data.planKey && !plan) return NextResponse.json({ error: "Plan not found." }, { status: 404 });
  const amount = plan?.price ?? parsed.data.amount ?? 0;
  const credits = plan?.credits ?? parsed.data.credits ?? 0;

  const payment = await prisma.$transaction(async (tx) => {
    const nextPayment = await tx.payment.create({
      data: { userId: user.id, code, amount, credits }
    });
    if (plan) {
      await tx.subscription.create({
        data: {
          userId: user.id,
          provider: `bank_transfer:${plan.key}:${plan.durationDays}`,
          providerId: code,
          status: "pending",
          currentPeriodEnd: null
        }
      });
    }
    return nextPayment;
  });
  await writeAuditLog(prisma, {
    userId: user.id,
    action: "payment.create",
    entity: "Payment",
    entityId: payment.id
  });
  await safeNotifyPaymentPending({ paymentId: payment.id });

  return NextResponse.json(
    {
      payment,
      transfer: createBankTransferInstruction({
        code: payment.code,
        amount: payment.amount,
        credits: payment.credits
      })
    },
    { status: 201 }
  );
}
