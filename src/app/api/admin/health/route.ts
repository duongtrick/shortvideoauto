import { NextResponse } from "next/server";
import { adminAuthStatus, requireAdmin } from "@/services/auth";

export async function GET() {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json({ error: "Admin access required." }, { status: adminAuthStatus(error) });
  }

  return NextResponse.json({ ok: true });
}
