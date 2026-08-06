import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminAuthStatus, requireAdmin } from "@/services/auth";
import { writeAuditLog } from "@/services/audit";

type RouteContext = {
  params: Promise<{ paymentId: string }>;
};

export async function POST(_: Request, context: RouteContext) {
  const { paymentId } = await context.params;
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    return NextResponse.json({ error: "Admin access required." }, { status: adminAuthStatus(error) });
  }

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  if (payment.status === "refunded") return NextResponse.json({ payment });

  const refunded = await prisma.$transaction(async (tx) => {
    const nextPayment = await tx.payment.update({
      where: { id: payment.id },
      data: { status: "refunded" }
    });
    if (payment.status === "paid") {
      await tx.creditLedger.create({
        data: {
          userId: payment.userId,
          delta: -payment.credits,
          reason: "admin_adjustment",
          meta: { paymentId: payment.id, refund: true }
        }
      });
    }
    await writeAuditLog(tx, {
      userId: admin.id,
      action: "payment.refund",
      entity: "Payment",
      entityId: payment.id
    });
    return nextPayment;
  });

  return NextResponse.json({ payment: refunded });
}
