import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminSeriesInput } from "@/lib/series-validation";
import { requireAdmin } from "@/services/auth";
import { writeAuditLog } from "@/services/audit";

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim();
  const isActive = url.searchParams.get("isActive");
  const take = Math.min(Number(url.searchParams.get("take") || 50), 100);

  const series = await prisma.contentSeries.findMany({
    where: {
      isActive: isActive === null ? undefined : isActive === "true",
      OR: q
        ? [
            { name: { contains: q, mode: "insensitive" } },
            { niche: { contains: q, mode: "insensitive" } },
            { user: { email: { contains: q, mode: "insensitive" } } }
          ]
        : undefined
    },
    take,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, email: true } },
      _count: { select: { jobs: true } }
    }
  });

  return NextResponse.json({ series });
}

export async function POST(request: Request) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const parsed = adminSeriesInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid series." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.userEmail } });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const { userEmail: _, ...data } = parsed.data;
  const series = await prisma.contentSeries.create({
    data: {
      userId: user.id,
      ...data
    }
  });
  await writeAuditLog(prisma, {
    userId: admin.id,
    action: "series.admin_create",
    entity: "ContentSeries",
    entityId: series.id,
    meta: { userId: user.id }
  });

  return NextResponse.json({ series }, { status: 201 });
}
