import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resetPasswordInput } from "@/lib/auth-validation";
import { hashPassword, hashToken } from "@/services/passwords";
import { writeAuditLog } from "@/services/audit";

export async function POST(request: Request) {
  const parsed = resetPasswordInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid reset request." }, { status: 400 });

  const user = await prisma.user.findFirst({
    where: {
      resetTokenHash: hashToken(parsed.data.token),
      resetTokenExpiresAt: { gt: new Date() }
    }
  });

  if (!user) return NextResponse.json({ error: "Reset link expired." }, { status: 400 });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: hashPassword(parsed.data.password),
      resetTokenHash: null,
      resetTokenExpiresAt: null
    }
  });
  await writeAuditLog(prisma, {
    userId: user.id,
    action: "user.password_reset_complete",
    entity: "User",
    entityId: user.id
  });

  return NextResponse.json({ ok: true });
}
