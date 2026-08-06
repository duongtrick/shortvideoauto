import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminUpdateUserInput } from "@/lib/admin-user-validation";
import { adminAuthStatus, requireAdmin } from "@/services/auth";
import { writeAuditLog } from "@/services/audit";
import { hashPassword } from "@/services/passwords";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { userId } = await context.params;
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    return NextResponse.json({ error: "Admin access required." }, { status: adminAuthStatus(error) });
  }

  const parsed = adminUpdateUserInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid user." }, { status: 400 });

  const exists = await prisma.user.findUnique({ where: { id: userId } });
  if (!exists) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      role: parsed.data.role,
      passwordHash: parsed.data.password ? hashPassword(parsed.data.password) : undefined,
      emailVerified:
        parsed.data.emailVerified === undefined ? undefined : parsed.data.emailVerified ? new Date() : null
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true
    }
  });

  await writeAuditLog(prisma, {
    userId: admin.id,
    action: "user.admin_update",
    entity: "User",
    entityId: user.id,
    meta: { role: user.role }
  });

  return NextResponse.json({ user });
}

export async function DELETE(_: Request, context: RouteContext) {
  const { userId } = await context.params;
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    return NextResponse.json({ error: "Admin access required." }, { status: adminAuthStatus(error) });
  }

  if (admin.id === userId) {
    return NextResponse.json({ error: "Admin cannot delete self." }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { id: userId } });
  if (!exists) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: "deleted" },
    select: { id: true, email: true, name: true, role: true, updatedAt: true }
  });

  await writeAuditLog(prisma, {
    userId: admin.id,
    action: "user.admin_delete",
    entity: "User",
    entityId: user.id
  });

  return NextResponse.json({ user });
}
