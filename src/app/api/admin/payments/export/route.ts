import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { csvHeaders, formatCsv } from "@/services/csv";
import { requireAdmin } from "@/services/auth";

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || undefined;
  const payments = await prisma.payment.findMany({
    where: { status },
    take: 500,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true } } }
  });

  const csv = formatCsv(
    payments.map((payment) => ({
      id: payment.id,
      code: payment.code,
      email: payment.user.email,
      amount: payment.amount,
      credits: payment.credits,
      status: payment.status,
      bankTxnId: payment.bankTxnId,
      matchedAt: payment.matchedAt,
      createdAt: payment.createdAt
    })),
    ["id", "code", "email", "amount", "credits", "status", "bankTxnId", "matchedAt", "createdAt"]
  );

  return new NextResponse(csv, { headers: csvHeaders("payments.csv") });
}
