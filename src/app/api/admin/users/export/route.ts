import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminUsersQuery } from "@/lib/admin-user-validation";
import { csvHeaders, formatCsv } from "@/services/csv";
import { adminAuthStatus, requireAdmin } from "@/services/auth";

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json({ error: "Admin access required." }, { status: adminAuthStatus(error) });
  }

  const url = new URL(request.url);
  const parsed = adminUsersQuery.safeParse({ ...Object.fromEntries(url.searchParams), take: "100" });
  if (!parsed.success) return NextResponse.json({ error: "Invalid user query." }, { status: 400 });

  const users = await prisma.user.findMany({
    where: {
      role: parsed.data.role,
      OR: parsed.data.q
        ? [
            { email: { contains: parsed.data.q, mode: "insensitive" as const } },
            { name: { contains: parsed.data.q, mode: "insensitive" as const } }
          ]
        : undefined
    },
    take: parsed.data.take,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      _count: { select: { jobs: true, videos: true, payments: true } }
    }
  });

  const csv = formatCsv(
    users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
      jobs: user._count.jobs,
      videos: user._count.videos,
      payments: user._count.payments,
      createdAt: user.createdAt
    })),
    ["id", "email", "name", "role", "emailVerified", "jobs", "videos", "payments", "createdAt"]
  );

  return new NextResponse(csv, { headers: csvHeaders("users.csv") });
}
