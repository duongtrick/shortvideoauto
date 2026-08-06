import { NextResponse } from "next/server";
import { createPublicStorageUrl, verifySignedDownloadUrl } from "@/services/storage";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key") ?? "";
  const expires = url.searchParams.get("expires") ?? "";
  const signature = url.searchParams.get("signature") ?? "";

  if (!verifySignedDownloadUrl({ key, expires, signature })) {
    return NextResponse.json({ error: "Invalid or expired download URL." }, { status: 403 });
  }

  const publicUrl = createPublicStorageUrl(key);
  if (publicUrl) {
    return NextResponse.redirect(publicUrl);
  }

  // ponytail: local dev has no object gateway; add S3/R2 SDK presign when private buckets replace public/CDN storage.
  return NextResponse.json({ storageKey: key });
}
