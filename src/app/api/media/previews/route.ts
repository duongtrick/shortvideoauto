import { NextResponse } from "next/server";
import { mediaPreviewQuery } from "@/lib/media-preview-validation";
import { requireCurrentUser } from "@/services/auth";
import { listMediaPreviews } from "@/services/media-preview";

export async function GET(request: Request) {
  await requireCurrentUser();
  const url = new URL(request.url);
  const parsed = mediaPreviewQuery.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Invalid media preview filters." }, { status: 400 });

  return NextResponse.json(listMediaPreviews(parsed.data));
}
