import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { changePasswordInput } from "@/lib/auth-validation";
import { requireCurrentUser } from "@/services/auth";
import { hashPassword, verifyPassword } from "@/services/passwords";
import { writeAuditLog } from "@/services/audit";
import { safeNotifyPasswordChanged } from "@/services/notifications";

export async function POST(request: Request) {
  const parsed = changePasswordInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid password change." }, { status: 400 });

  const currentUser = await requireCurrentUser();
  const user = await prisma.user.findUnique({ where: { id: currentUser.id } });
  if (!user || !verifyPassword(parsed.data.currentPassword, user.passwordHash)) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashPassword(parsed.data.newPassword) }
  });
  await writeAuditLog(prisma, {
    userId: user.id,
    action: "user.password_change",
    entity: "User",
    entityId: user.id
  });
  await safeNotifyPasswordChanged({ userId: user.id });

  return NextResponse.json({ ok: true });
}
