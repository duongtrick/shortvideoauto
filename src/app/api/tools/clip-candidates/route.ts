import { NextResponse } from "next/server";
import { clipCandidatesInput } from "@/lib/clip-candidates-validation";
import { requireCurrentUser } from "@/services/auth";
import { createClipCandidates } from "@/services/clip-candidates";

export async function POST(request: Request) {
  await requireCurrentUser();
  const parsed = clipCandidatesInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid clip candidate input." }, { status: 400 });

  try {
    return NextResponse.json(createClipCandidates(parsed.data));
  } catch {
    return NextResponse.json({ error: "Invalid long video URL." }, { status: 400 });
  }
}
