import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminSeriesPatch } from "@/lib/series-validation";
import { adminAuthStatus, requireAdmin } from "@/services/auth";
import { writeAuditLog } from "@/services/audit";

type RouteContext = {
  params: Promise<{ seriesId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { seriesId } = await context.params;
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    return NextResponse.json({ error: "Admin access required." }, { status: adminAuthStatus(error) });
  }

  const parsed = adminSeriesPatch.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid series." }, { status: 400 });

  const series = await prisma.contentSeries.update({
    where: { id: seriesId },
    data: parsed.data
  });
  await writeAuditLog(prisma, {
    userId: admin.id,
    action: "series.admin_update",
    entity: "ContentSeries",
    entityId: series.id,
    meta: { isActive: series.isActive }
  });

  return NextResponse.json({ series });
}
