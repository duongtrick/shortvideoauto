import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { matchBankTransaction, type BankTransaction } from "@/services/bank-payments";

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!process.env.BANK_POLL_TOKEN || token !== process.env.BANK_POLL_TOKEN) {
    return NextResponse.json({ error: "Invalid bank poll token." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { transactions?: BankTransaction[] } | null;
  const transactions = body?.transactions ?? [];
  const pending = await prisma.payment.findMany({
    where: { status: "pending" },
    take: 100,
    orderBy: { createdAt: "asc" }
  });

  const matched: string[] = [];
  for (const transaction of transactions) {
    const payment = pending.find((item) => matchBankTransaction(transaction, item));
    if (!payment) continue;

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "paid",
          bankTxnId: transaction.id,
          matchedAt: new Date(transaction.happenedAt ?? Date.now())
        }
      });
      await tx.creditLedger.create({
        data: {
          userId: payment.userId,
          delta: payment.credits,
          reason: "bank_payment",
          meta: { paymentId: payment.id, bankTxnId: transaction.id }
        }
      });
    });
    matched.push(payment.code);
  }

  return NextResponse.json({ matched });
}
