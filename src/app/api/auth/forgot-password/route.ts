import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emailInput } from "@/lib/auth-validation";
import { createResetToken } from "@/services/passwords";
import { writeAuditLog } from "@/services/audit";
import { env } from "@/lib/env";
import { safeNotifyPasswordResetRequested } from "@/services/notifications";

export async function POST(request: Request) {
  try {
    const parsed = emailInput.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid email." }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user) return NextResponse.json({ ok: true });

    const reset = createResetToken();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash: reset.tokenHash,
        resetTokenExpiresAt: reset.expiresAt
      }
    });
    await writeAuditLog(prisma, {
      userId: user.id,
      action: "user.password_reset_request",
      entity: "User",
      entityId: user.id
    });
    const resetUrl = new URL("/reset-password", env.APP_URL);
    resetUrl.searchParams.set("token", reset.token);
    await safeNotifyPasswordResetRequested({
      userId: user.id,
      resetUrl: resetUrl.toString(),
      expiresMinutes: 30
    });

    // ponytail: local dev returns token; replace with email provider before production.
    return NextResponse.json({
      ok: true,
      resetUrl:
        process.env.NODE_ENV === "production"
          ? undefined
          : `/reset-password?token=${encodeURIComponent(reset.token)}`
    });
  } catch {
    return NextResponse.json({ error: "Service unavailable. Check database connection." }, { status: 503 });
  }
}
