import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emailInput } from "@/lib/auth-validation";
import { writeAuditLog } from "@/services/audit";
import { createEmailVerificationUrl } from "@/services/email-verification";
import { safeNotifyEmailVerificationRequested } from "@/services/notifications";

export async function POST(request: Request) {
  try {
    const parsed = emailInput.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid email." }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    const verifyUrl = user && !user.emailVerified ? createEmailVerificationUrl(user.email) : null;

    if (user && verifyUrl) {
      await safeNotifyEmailVerificationRequested({ userId: user.id, verifyUrl, expiresHours: 24 });
      await writeAuditLog(prisma, {
        userId: user.id,
        action: "user.email_verify_resend",
        entity: "User",
        entityId: user.id
      });
    }

    return NextResponse.json({
      ok: true,
      verifyUrl: process.env.NODE_ENV === "production" ? undefined : verifyUrl ?? undefined
    });
  } catch {
    return NextResponse.json({ error: "Service unavailable. Check database connection." }, { status: 503 });
  }
}
