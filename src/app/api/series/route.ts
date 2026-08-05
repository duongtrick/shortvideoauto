import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seriesInput } from "@/lib/series-validation";
import { requireCurrentUser } from "@/services/auth";
import { writeAuditLog } from "@/services/audit";

export async function GET() {
  const user = await requireCurrentUser();
  const series = await prisma.contentSeries.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ series });
}

export async function POST(request: Request) {
  const user = await requireCurrentUser();
  const parsed = seriesInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid series." }, { status: 400 });

  const series = await prisma.contentSeries.create({
    data: {
      userId: user.id,
      ...parsed.data
    }
  });
  await writeAuditLog(prisma, {
    userId: user.id,
    action: "series.create",
    entity: "ContentSeries",
    entityId: series.id
  });

  return NextResponse.json({ series }, { status: 201 });
}
