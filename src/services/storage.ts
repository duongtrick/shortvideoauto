import { createHmac } from "node:crypto";
import { env } from "@/lib/env";

export function createStorageKey(input: { userId: string; jobId: string; ext: "mp4" | "mp3" }) {
  return `${input.ext === "mp4" ? "videos" : "voice"}/${input.userId}/${input.jobId}.${input.ext}`;
}

export function createSignedDownloadUrl(storageKey: string, expiresInSeconds = 300) {
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const secret = process.env.STORAGE_SIGNING_SECRET || "local-dev-storage-secret";
  const signature = createHmac("sha256", secret).update(`${storageKey}:${expires}`).digest("hex");
  const url = new URL("/api/videos/download", env.APP_URL);
  url.searchParams.set("key", storageKey);
  url.searchParams.set("expires", String(expires));
  url.searchParams.set("signature", signature);
  return url.toString();
}

export function verifySignedDownloadUrl(input: { key: string; expires: string; signature: string }) {
  const expires = Number(input.expires);
  if (!Number.isSafeInteger(expires) || expires < Math.floor(Date.now() / 1000)) {
    return false;
  }

  const secret = process.env.STORAGE_SIGNING_SECRET || "local-dev-storage-secret";
  const expected = createHmac("sha256", secret).update(`${input.key}:${expires}`).digest("hex");
  return expected === input.signature;
}
