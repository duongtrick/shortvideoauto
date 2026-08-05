import { NextResponse } from "next/server";
import { verifySignedDownloadUrl } from "@/services/storage";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key") ?? "";
  const expires = url.searchParams.get("expires") ?? "";
  const signature = url.searchParams.get("signature") ?? "";

  if (!verifySignedDownloadUrl({ key, expires, signature })) {
    return NextResponse.json({ error: "Invalid or expired download URL." }, { status: 403 });
  }

  // ponytail: returns storage key only; replace with S3/R2 redirect once bucket credentials exist.
  return NextResponse.json({ storageKey: key });
}
