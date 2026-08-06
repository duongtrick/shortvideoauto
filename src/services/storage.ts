import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

const storageKeyPattern = /^(videos|voice)\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\.(mp4|mp3)$/;

export function createStorageKey(input: { userId: string; jobId: string; ext: "mp4" | "mp3" }) {
  return `${input.ext === "mp4" ? "videos" : "voice"}/${input.userId}/${input.jobId}.${input.ext}`;
}

export function isValidStorageKey(key: string) {
  return storageKeyPattern.test(key);
}

export function createPublicStorageUrl(key: string, publicBaseUrl = env.STORAGE_PUBLIC_BASE_URL) {
  if (!publicBaseUrl || !isValidStorageKey(key)) return null;
  const baseUrl = new URL(publicBaseUrl);
  const normalizedBase = baseUrl.pathname.replace(/\/$/, "");
  baseUrl.pathname = `${normalizedBase}/${key.split("/").map(encodeURIComponent).join("/")}`;
  return baseUrl.toString();
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
  if (!isValidStorageKey(input.key)) {
    return false;
  }

  const expires = Number(input.expires);
  if (!Number.isSafeInteger(expires) || expires < Math.floor(Date.now() / 1000)) {
    return false;
  }

  const secret = process.env.STORAGE_SIGNING_SECRET || "local-dev-storage-secret";
  const expected = createHmac("sha256", secret).update(`${input.key}:${expires}`).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(input.signature, "hex");
  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}
