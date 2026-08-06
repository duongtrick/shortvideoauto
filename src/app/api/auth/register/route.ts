import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerInput } from "@/lib/auth-validation";
import { hashPassword } from "@/services/passwords";
import { writeAuditLog } from "@/services/audit";
import { createEmailVerificationUrl } from "@/services/email-verification";
import { safeNotifyEmailVerificationRequested, safeNotifyWelcome } from "@/services/notifications";

export async function POST(request: Request) {
  const parsed = registerInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid registration." }, { status: 400 });

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return NextResponse.json({ error: "Email already registered." }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash: hashPassword(parsed.data.password)
    }
  });
  const verifyUrl = createEmailVerificationUrl(user.email);

  const ref = new URL(request.url).searchParams.get("ref");
  if (ref) {
    await prisma.referral.updateMany({
      where: { code: ref, status: "clicked" },
      data: {
        status: "converted",
        referredEmail: user.email,
        convertedAt: new Date()
      }
    });
  }

  await writeAuditLog(prisma, {
    userId: user.id,
    action: "user.register",
    entity: "User",
    entityId: user.id
  });
  await safeNotifyEmailVerificationRequested({ userId: user.id, verifyUrl, expiresHours: 24 });
  await safeNotifyWelcome({ userId: user.id });

  return NextResponse.json({
    ok: true,
    verifyUrl: process.env.NODE_ENV === "production" ? undefined : verifyUrl
  }, { status: 201 });
}
