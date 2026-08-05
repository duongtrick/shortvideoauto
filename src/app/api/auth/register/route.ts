import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerInput } from "@/lib/auth-validation";
import { hashPassword } from "@/services/passwords";
import { writeAuditLog } from "@/services/audit";

export async function POST(request: Request) {
  const parsed = registerInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid registration." }, { status: 400 });

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return NextResponse.json({ error: "Email already registered." }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash: hashPassword(parsed.data.password),
      emailVerified: new Date()
    }
  });

  await writeAuditLog(prisma, {
    userId: user.id,
    action: "user.register",
    entity: "User",
    entityId: user.id
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
