import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminCreateUserInput, adminUsersQuery } from "@/lib/admin-user-validation";
import { adminAuthStatus, requireAdmin } from "@/services/auth";
import { writeAuditLog } from "@/services/audit";
import { hashPassword } from "@/services/passwords";

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json({ error: "Admin access required." }, { status: adminAuthStatus(error) });
  }

  const url = new URL(request.url);
  const parsed = adminUsersQuery.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Invalid user query." }, { status: 400 });

  const where = {
    role: parsed.data.role,
    OR: parsed.data.q
      ? [
          { email: { contains: parsed.data.q, mode: "insensitive" as const } },
          { name: { contains: parsed.data.q, mode: "insensitive" as const } }
        ]
      : undefined
  };

  const [rows, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip: parsed.data.skip,
      take: parsed.data.take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        creditLedger: { select: { delta: true } },
        _count: { select: { jobs: true, videos: true, payments: true } }
      }
    }),
    prisma.user.count({ where })
  ]);
  const users = rows.map((user) => ({
    ...user,
    credits: user.creditLedger.reduce((totalCredits, entry) => totalCredits + entry.delta, 0),
    creditLedger: undefined
  }));

  return NextResponse.json({ users, total, skip: parsed.data.skip, take: parsed.data.take });
}

export async function POST(request: Request) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    return NextResponse.json({ error: "Admin access required." }, { status: adminAuthStatus(error) });
  }

  const parsed = adminCreateUserInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid user." }, { status: 400 });

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return NextResponse.json({ error: "Email already registered." }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      role: parsed.data.role,
      passwordHash: parsed.data.password ? hashPassword(parsed.data.password) : undefined,
      emailVerified: parsed.data.emailVerified ? new Date() : null
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
    action: "user.admin_create",
    entity: "User",
    entityId: user.id,
    meta: { role: user.role }
  });

  return NextResponse.json({ user }, { status: 201 });
}
