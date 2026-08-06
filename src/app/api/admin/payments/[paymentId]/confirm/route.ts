import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminAuthStatus, requireAdmin } from "@/services/auth";
import { writeAuditLog } from "@/services/audit";
import { safeNotifyPaymentConfirmed } from "@/services/notifications";
import { activatePendingSubscriptionForPayment } from "@/services/subscriptions";

type RouteContext = {
  params: Promise<{ paymentId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { paymentId } = await context.params;
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    return NextResponse.json({ error: "Admin access required." }, { status: adminAuthStatus(error) });
  }

  const body = (await request.json().catch(() => null)) as { bankTxnId?: string } | null;
  const bankTxnId = body?.bankTxnId?.trim();
  if (!bankTxnId) return NextResponse.json({ error: "bankTxnId is required." }, { status: 400 });

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  if (payment.status === "paid") return NextResponse.json({ payment });

  const confirmed = await prisma.$transaction(async (tx) => {
    const nextPayment = await tx.payment.update({
      where: { id: payment.id },
      data: { status: "paid", bankTxnId, matchedAt: new Date() }
    });
    await tx.creditLedger.create({
      data: {
        userId: payment.userId,
        delta: payment.credits,
        reason: "bank_payment",
        meta: { paymentId: payment.id, bankTxnId, manual: true }
      }
    });
    await activatePendingSubscriptionForPayment(tx, { paymentCode: payment.code });
    await writeAuditLog(tx, {
      userId: admin.id,
      action: "payment.manual_confirm",
      entity: "Payment",
      entityId: payment.id,
      meta: { bankTxnId }
    });
    return nextPayment;
  });
  await safeNotifyPaymentConfirmed({ paymentId: confirmed.id });

  return NextResponse.json({ payment: confirmed });
}
