import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createBankPaymentInput } from "@/lib/billing-validation";
import { requireCurrentUser } from "@/services/auth";
import { createBankTransferInstruction, createPaymentCode } from "@/services/bank-payments";
import { writeAuditLog } from "@/services/audit";

export async function GET() {
  const user = await requireCurrentUser();
  const payments = await prisma.payment.findMany({
    where: { userId: user.id },
    take: 20,
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ payments });
}

export async function POST(request: Request) {
  const user = await requireCurrentUser();
  const parsed = createBankPaymentInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payment request." }, { status: 400 });

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      code: createPaymentCode(),
      amount: parsed.data.amount,
      credits: parsed.data.credits
    }
  });
  await writeAuditLog(prisma, {
    userId: user.id,
    action: "payment.create",
    entity: "Payment",
    entityId: payment.id
  });

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
