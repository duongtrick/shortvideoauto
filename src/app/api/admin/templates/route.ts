import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { adminAuthStatus, requireAdmin } from "@/services/auth";
import { writeAuditLog } from "@/services/audit";

const templateInput = z.object({
  key: z.string().min(2).max(80),
  name: z.string().min(2).max(120),
  config: z.record(z.string(), z.unknown()).default({}),
  isActive: z.boolean().default(true)
});

export async function GET() {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json({ error: "Admin access required." }, { status: adminAuthStatus(error) });
  }

  const templates = await prisma.videoTemplate.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ templates });
}

export async function POST(request: Request) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    return NextResponse.json({ error: "Admin access required." }, { status: adminAuthStatus(error) });
  }

  const parsed = templateInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid template." }, { status: 400 });

  const template = await prisma.videoTemplate.create({
    data: {
      ...parsed.data,
      config: parsed.data.config as Prisma.InputJsonObject
    }
  });
  await writeAuditLog(prisma, {
    userId: admin.id,
    action: "template.create",
    entity: "VideoTemplate",
    entityId: template.id
  });

  return NextResponse.json({ template }, { status: 201 });
}
