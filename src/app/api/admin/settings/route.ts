import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/services/auth";
import { setSystemSetting } from "@/services/system-settings";
import { writeAuditLog } from "@/services/audit";

const settingInput = z.object({
  key: z.string().min(2).max(80),
  value: z.union([z.string(), z.number(), z.boolean(), z.record(z.string(), z.unknown())]),
  group: z.string().min(2).max(80).default("general")
});

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const url = new URL(request.url);
  const group = url.searchParams.get("group") || undefined;
  const settings = await prisma.systemSetting.findMany({
    where: { group },
    orderBy: [{ group: "asc" }, { key: "asc" }]
  });

  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const parsed = settingInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid setting." }, { status: 400 });

  const setting = await setSystemSetting(prisma, {
    key: parsed.data.key,
    value: parsed.data.value as Prisma.InputJsonValue,
    group: parsed.data.group
  });
  await writeAuditLog(prisma, {
    userId: admin.id,
    action: "settings.update",
    entity: "SystemSetting",
    entityId: setting.id,
    meta: { key: setting.key, group: setting.group }
  });

  return NextResponse.json({ setting });
}
