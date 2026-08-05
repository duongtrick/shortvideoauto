import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createRenderQueue } from "@/lib/queue";
import { checkRateLimit } from "@/lib/rate-limit";
import { createJobInput, parseProductUrl } from "@/lib/product-url";
import { getCurrentUser } from "@/services/auth";
import { logger } from "@/lib/logger";
import { writeAuditLog } from "@/services/audit";

export async function GET() {
  const currentUser = await getCurrentUser();
  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    include: {
      jobs: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          outputVideo: true,
          productSource: true
        }
      }
    }
  });

  return NextResponse.json({ jobs: user?.jobs ?? [] });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rateLimit = checkRateLimit(`create-job:${ip}`, 10, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many render requests." }, { status: 429 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? await request.json().catch(() => null)
    : Object.fromEntries(await request.formData());
  const parsed = createJobInput.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product URL." }, { status: 400 });
  }

  let productUrl: ReturnType<typeof parseProductUrl>;
  try {
    productUrl = parseProductUrl(parsed.data.url);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unsupported product URL." },
      { status: 400 }
    );
  }

  const user = await getCurrentUser();

  const job = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const creditHold = await tx.creditLedger.create({
      data: {
        userId: user.id,
        delta: -1,
        reason: "render_reserved",
        meta: { sourceUrl: productUrl.normalizedUrl }
      }
    });

    return tx.renderJob.create({
      data: {
        userId: user.id,
        sourceUrl: productUrl.normalizedUrl,
        creditHoldId: creditHold.id
      }
    });
  });

  await writeAuditLog(prisma, {
    userId: user.id,
    action: "job.create",
    entity: "RenderJob",
    entityId: job.id
  });

  const queue = createRenderQueue();
  await queue.add(
    "render-product-video",
    { jobId: job.id, userId: user.id, sourceUrl: productUrl.normalizedUrl },
    { jobId: job.id }
  );
  await queue.close();

  logger.info("render_job_created", { jobId: job.id, userId: user.id });
  return NextResponse.json({ jobId: job.id, status: job.status }, { status: 202 });
}
