import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminAuthStatus, requireAdmin } from "@/services/auth";
import { getAdminStats } from "@/services/admin-stats";

export async function GET() {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json({ error: "Admin access required." }, { status: adminAuthStatus(error) });
  }

  return NextResponse.json(await getAdminStats(prisma));
}
