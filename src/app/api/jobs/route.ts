import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createRenderQueue } from "@/lib/queue";
import { createJobInput, parseProductUrl } from "@/lib/product-url";

const demoUserEmail = "demo@shortvideoauto.local";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
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

  const user = await prisma.user.upsert({
    where: { email: demoUserEmail },
    update: {},
    create: { email: demoUserEmail, name: "Demo User" }
  });

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

  const queue = createRenderQueue();
  await queue.add(
    "render-product-video",
    { jobId: job.id, userId: user.id, sourceUrl: productUrl.normalizedUrl },
    { jobId: job.id }
  );
  await queue.close();

  return NextResponse.json({ jobId: job.id, status: job.status }, { status: 202 });
}
