import { NextResponse } from "next/server";
import { audioMixInput } from "@/lib/audio-mix-validation";
import { requireCurrentUser } from "@/services/auth";
import { createMusicDuckingPlan } from "@/services/audio-mix";

export async function POST(request: Request) {
  await requireCurrentUser();
  const parsed = audioMixInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid audio mix input." }, { status: 400 });

  return NextResponse.json({ plan: createMusicDuckingPlan(parsed.data) });
}
