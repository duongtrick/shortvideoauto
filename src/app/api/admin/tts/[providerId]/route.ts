import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { adminProviderPatch } from "@/lib/admin-provider-validation";
import { requireAdmin } from "@/services/auth";
import { writeAuditLog } from "@/services/audit";

type RouteContext = {
  params: Promise<{ providerId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { providerId } = await context.params;
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const parsed = adminProviderPatch.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid TTS provider." }, { status: 400 });

  const provider = await prisma.tTSProvider.update({
    where: { id: providerId },
    data: {
      name: parsed.data.name,
      config: parsed.data.config as Prisma.InputJsonObject | undefined,
      isActive: parsed.data.isActive
    }
  });
  await writeAuditLog(prisma, {
    userId: admin.id,
    action: "tts_provider.update",
    entity: "TTSProvider",
    entityId: provider.id,
    meta: { key: provider.key }
  });

  return NextResponse.json({ provider });
}

export async function DELETE(_: Request, context: RouteContext) {
  const { providerId } = await context.params;
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const provider = await prisma.tTSProvider.update({
    where: { id: providerId },
    data: { isActive: false }
  });
  await writeAuditLog(prisma, {
    userId: admin.id,
    action: "tts_provider.disable",
    entity: "TTSProvider",
    entityId: provider.id,
    meta: { key: provider.key }
  });

  return NextResponse.json({ provider });
}
