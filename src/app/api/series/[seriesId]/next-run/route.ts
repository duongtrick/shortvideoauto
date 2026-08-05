import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/services/auth";
import { createNextSeriesRun } from "@/services/series-automation";

type RouteContext = {
  params: Promise<{ seriesId: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const user = await requireCurrentUser();
  const { seriesId } = await context.params;
  const series = await prisma.contentSeries.findFirst({
    where: { id: seriesId, userId: user.id },
    include: { jobs: { orderBy: { createdAt: "desc" }, take: 1 } }
  });
  if (!series) return NextResponse.json({ error: "Series not found." }, { status: 404 });

  const creditBalance = await prisma.creditLedger.aggregate({
    where: { userId: user.id },
    _sum: { delta: true }
  });
  const plan = createNextSeriesRun({
    seriesId: series.id,
    cadence: series.cadence,
    lastJobCreatedAt: series.jobs[0]?.createdAt,
    hasCredits: (creditBalance._sum.delta ?? 0) > 0
  });

  return NextResponse.json({ plan });
}
