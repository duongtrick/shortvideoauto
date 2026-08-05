import type { Prisma, PrismaClient } from "@prisma/client";

type Db = PrismaClient | Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

export async function writeAuditLog(
  db: Db,
  input: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    meta?: Prisma.InputJsonObject;
  }
) {
  return db.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      meta: input.meta
    }
  });
}
