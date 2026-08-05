import { NextResponse } from "next/server";
import { tiktokCalculatorInput } from "@/lib/tiktok-calculator-validation";
import { estimateTikTokAccount } from "@/services/tiktok-calculator";

export async function POST(request: Request) {
  const parsed = tiktokCalculatorInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid TikTok metrics." }, { status: 400 });

  return NextResponse.json({
    username: parsed.data.username,
    estimate: estimateTikTokAccount(parsed.data)
  });
}
