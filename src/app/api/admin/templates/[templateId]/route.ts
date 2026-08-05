import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/services/auth";
import { writeAuditLog } from "@/services/audit";

const templatePatch = z.object({
  name: z.string().min(2).max(120).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional()
});

type RouteContext = {
  params: Promise<{ templateId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { templateId } = await context.params;
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const parsed = templatePatch.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid template." }, { status: 400 });

  const template = await prisma.videoTemplate.update({
    where: { id: templateId },
    data: {
      name: parsed.data.name,
      isActive: parsed.data.isActive,
      config: parsed.data.config as Prisma.InputJsonObject | undefined
    }
  });
  await writeAuditLog(prisma, {
    userId: admin.id,
    action: "template.update",
    entity: "VideoTemplate",
    entityId: template.id
  });

  return NextResponse.json({ template });
}

export async function DELETE(_: Request, context: RouteContext) {
  const { templateId } = await context.params;
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const template = await prisma.videoTemplate.update({
    where: { id: templateId },
    data: { isActive: false }
  });
  await writeAuditLog(prisma, {
    userId: admin.id,
    action: "template.delete",
    entity: "VideoTemplate",
    entityId: template.id
  });

  return NextResponse.json({ template });
}
