import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminBanUserInput } from "@/lib/admin-user-validation";
import { requireAdmin } from "@/services/auth";
import { writeAuditLog } from "@/services/audit";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { userId } = await context.params;
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  if (admin.id === userId) {
    return NextResponse.json({ error: "Admin cannot ban self." }, { status: 400 });
  }

  const parsed = adminBanUserInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid ban state." }, { status: 400 });

  const exists = await prisma.user.findUnique({ where: { id: userId } });
  if (!exists) return NextResponse.json({ error: "User not found." }, { status: 404 });
  if (exists.role === "deleted") return NextResponse.json({ error: "Deleted user cannot be updated." }, { status: 400 });

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: parsed.data.banned ? "banned" : "user" },
    select: { id: true, email: true, name: true, role: true, updatedAt: true }
  });

  await writeAuditLog(prisma, {
    userId: admin.id,
    action: parsed.data.banned ? "user.ban" : "user.unban",
    entity: "User",
    entityId: user.id
  });

  return NextResponse.json({ user });
}
