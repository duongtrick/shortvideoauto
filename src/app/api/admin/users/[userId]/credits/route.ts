import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminCreditAdjustmentInput } from "@/lib/admin-user-validation";
import { requireAdmin } from "@/services/auth";
import { writeAuditLog } from "@/services/audit";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { userId } = await context.params;
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const parsed = adminCreditAdjustmentInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid credit adjustment." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const ledger = await prisma.$transaction(async (tx) => {
    const entry = await tx.creditLedger.create({
      data: {
        userId,
        delta: parsed.data.delta,
        reason: "admin_adjustment",
        meta: { note: parsed.data.note ?? null, adminId: admin.id }
      }
    });
    await writeAuditLog(tx, {
      userId: admin.id,
      action: "user.credit_adjust",
      entity: "User",
      entityId: userId,
      meta: { delta: parsed.data.delta, note: parsed.data.note ?? null }
    });
    return entry;
  });

  const balance = await prisma.creditLedger.aggregate({
    where: { userId },
    _sum: { delta: true }
  });

  return NextResponse.json({ ledger, credits: balance._sum.delta ?? 0 });
}
