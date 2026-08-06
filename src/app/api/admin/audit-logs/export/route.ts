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
  const action = url.searchParams.get("action") || undefined;
  const entity = url.searchParams.get("entity") || undefined;
  const logs = await prisma.auditLog.findMany({
    where: { action, entity },
    take: 500,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true, role: true } } }
  });

  const csv = formatCsv(
    logs.map((log) => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      actorEmail: log.user?.email,
      actorRole: log.user?.role,
      meta: log.meta ? JSON.stringify(log.meta) : "",
      createdAt: log.createdAt
    })),
    ["id", "action", "entity", "entityId", "actorEmail", "actorRole", "meta", "createdAt"]
  );

  return new NextResponse(csv, { headers: csvHeaders("audit-logs.csv") });
}
