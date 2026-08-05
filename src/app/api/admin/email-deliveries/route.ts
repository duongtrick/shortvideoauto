import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emailDeliveryQuery } from "@/lib/email-delivery-validation";
import { requireAdmin } from "@/services/auth";

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const url = new URL(request.url);
  const parsed = emailDeliveryQuery.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Invalid email delivery filters." }, { status: 400 });

  const filters = parsed.data;
  const deliveries = await prisma.emailDelivery.findMany({
    where: {
      status: filters.status,
      event: filters.event,
      userId: filters.userId
    },
    take: filters.take,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, email: true, role: true } }
    }
  });

  return NextResponse.json({ deliveries });
}
