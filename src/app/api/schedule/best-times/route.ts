import { NextResponse } from "next/server";
import { bestTimeInput } from "@/lib/scheduler-validation";
import { requireCurrentUser } from "@/services/auth";
import { recommendBestScheduleTimes } from "@/services/scheduler";

export async function POST(request: Request) {
  await requireCurrentUser();
  const parsed = bestTimeInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid best-time input." }, { status: 400 });

  return NextResponse.json({ recommendations: recommendBestScheduleTimes(parsed.data) });
}
