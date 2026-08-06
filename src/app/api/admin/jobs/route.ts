import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminAuthStatus, requireAdmin } from "@/services/auth";

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json({ error: "Admin access required." }, { status: adminAuthStatus(error) });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || undefined;
  const take = Math.min(Number(url.searchParams.get("take") || 50), 100);

  const jobs = await prisma.renderJob.findMany({
    where: { status: status as never },
    take,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, email: true } },
      productSource: true,
      outputVideo: true
    }
  });

  return NextResponse.json({ jobs });
}
