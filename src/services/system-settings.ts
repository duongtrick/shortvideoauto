import type { Prisma, PrismaClient } from "@prisma/client";

export async function getSystemSetting<T>(
  prisma: PrismaClient,
  key: string,
  fallback: T
): Promise<T> {
  const setting = await prisma.systemSetting.findUnique({ where: { key } });
  return setting ? (setting.value as T) : fallback;
}

export async function setSystemSetting(
  prisma: PrismaClient,
  input: { key: string; value: Prisma.InputJsonValue; group?: string }
) {
  return prisma.systemSetting.upsert({
    where: { key: input.key },
    update: { value: input.value, group: input.group ?? "general" },
    create: { key: input.key, value: input.value, group: input.group ?? "general" }
  });
}
