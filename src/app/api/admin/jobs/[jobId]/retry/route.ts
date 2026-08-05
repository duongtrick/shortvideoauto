import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRenderQueue } from "@/lib/queue";
import { requireAdmin } from "@/services/auth";
import { writeAuditLog } from "@/services/audit";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

export async function POST(_: Request, context: RouteContext) {
  const { jobId } = await context.params;
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const job = await prisma.renderJob.findUnique({ where: { id: jobId } });
  if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 });
  if (job.status !== "failed") {
    return NextResponse.json({ error: "Only failed jobs can be retried." }, { status: 409 });
  }

  await prisma.renderJob.update({
    where: { id: job.id },
    data: { status: "queued", errorCode: null, errorMessage: null }
  });

  const queue = createRenderQueue();
  await queue.add(
    "render-product-video",
    { jobId: job.id, userId: job.userId, sourceUrl: job.sourceUrl },
    { jobId: `${job.id}:retry:${Date.now()}` }
  );
  await queue.close();

  await writeAuditLog(prisma, {
    userId: admin.id,
    action: "job.retry",
    entity: "RenderJob",
    entityId: job.id
  });

  return NextResponse.json({ jobId: job.id, status: "queued" });
}
