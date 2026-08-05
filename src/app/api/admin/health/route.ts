import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/services/auth";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const [users, jobs, videos] = await Promise.all([
    prisma.user.count(),
    prisma.renderJob.count(),
    prisma.video.count()
  ]);

  return NextResponse.json({ users, jobs, videos });
}
