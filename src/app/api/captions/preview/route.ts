import { NextResponse } from "next/server";
import { captionPreviewInput } from "@/lib/caption-validation";
import { createCaptionPreview } from "@/services/captions";

export async function POST(request: Request) {
  const parsed = captionPreviewInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid caption preview." }, { status: 400 });

  return NextResponse.json(createCaptionPreview(parsed.data));
}
