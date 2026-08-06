import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { adminProviderInput } from "@/lib/admin-provider-validation";
import { adminAuthStatus, requireAdmin } from "@/services/auth";
import { writeAuditLog } from "@/services/audit";

export async function GET() {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json({ error: "Admin access required." }, { status: adminAuthStatus(error) });
  }

  const providers = await prisma.tTSProvider.findMany({ orderBy: [{ isActive: "desc" }, { createdAt: "desc" }] });
  return NextResponse.json({ providers });
}

export async function POST(request: Request) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    return NextResponse.json({ error: "Admin access required." }, { status: adminAuthStatus(error) });
  }

  const parsed = adminProviderInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid TTS provider." }, { status: 400 });

  const provider = await prisma.tTSProvider.create({
    data: {
      ...parsed.data,
      config: parsed.data.config as Prisma.InputJsonObject
    }
  });
  await writeAuditLog(prisma, {
    userId: admin.id,
    action: "tts_provider.create",
    entity: "TTSProvider",
    entityId: provider.id,
    meta: { key: provider.key }
  });

  return NextResponse.json({ provider }, { status: 201 });
}
