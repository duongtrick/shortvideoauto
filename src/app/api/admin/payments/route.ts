import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/services/auth";

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || undefined;
  const take = Math.min(Number(url.searchParams.get("take") || 50), 100);

  const payments = await prisma.payment.findMany({
    where: { status },
    take,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, email: true } }
    }
  });

  return NextResponse.json({ payments });
}
