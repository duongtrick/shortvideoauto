import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/services/auth";
import { writeAuditLog } from "@/services/audit";

const seriesPatch = z.object({
  isActive: z.boolean()
});

type RouteContext = {
  params: Promise<{ seriesId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const user = await requireCurrentUser();
  const { seriesId } = await context.params;
  const parsed = seriesPatch.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid series update." }, { status: 400 });

  const series = await prisma.contentSeries.findFirst({ where: { id: seriesId, userId: user.id } });
  if (!series) return NextResponse.json({ error: "Series not found." }, { status: 404 });

  const updated = await prisma.contentSeries.update({
    where: { id: series.id },
    data: { isActive: parsed.data.isActive }
  });
  await writeAuditLog(prisma, {
    userId: user.id,
    action: parsed.data.isActive ? "series.resume" : "series.pause",
    entity: "ContentSeries",
    entityId: series.id
  });

  return NextResponse.json({ series: updated });
}
