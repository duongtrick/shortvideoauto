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
  const action = url.searchParams.get("action") || undefined;
  const entity = url.searchParams.get("entity") || undefined;
  const take = Math.min(Number(url.searchParams.get("take") || 50), 100);

  const logs = await prisma.auditLog.findMany({
    where: { action, entity },
    take,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, email: true, role: true }
      }
    }
  });

  return NextResponse.json({ logs });
}
