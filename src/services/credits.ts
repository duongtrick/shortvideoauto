import type { PrismaClient } from "@prisma/client";

type Db = PrismaClient | Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

export async function refundRenderCredit(db: Db, input: { userId: string; jobId: string }) {
  const existing = await db.creditLedger.findFirst({
    where: {
      userId: input.userId,
      reason: "render_refunded",
      meta: {
        path: ["jobId"],
        equals: input.jobId
      }
    }
  });

  if (existing) return existing;

  return db.creditLedger.create({
    data: {
      userId: input.userId,
      delta: 1,
      reason: "render_refunded",
      meta: { jobId: input.jobId }
    }
  });
}
