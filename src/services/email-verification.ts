import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

const expiresInMs = 24 * 60 * 60 * 1000;

export function createEmailVerificationUrl(email: string, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ email: email.toLowerCase(), expires: now + expiresInMs })).toString("base64url");
  const signature = signPayload(payload);
  const url = new URL("/verify-email", env.APP_URL);
  url.searchParams.set("token", `${payload}.${signature}`);
  return url.toString();
}

export function verifyEmailVerificationToken(token: string, now = Date.now()) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  try {
    const expected = signPayload(payload);
    const expectedBuffer = Buffer.from(expected, "hex");
    const actualBuffer = Buffer.from(signature, "hex");
    if (expectedBuffer.length !== actualBuffer.length || !timingSafeEqual(expectedBuffer, actualBuffer)) return null;

    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { email?: unknown; expires?: unknown };
    if (typeof data.email !== "string" || typeof data.expires !== "number" || data.expires < now) return null;
    return data.email.toLowerCase();
  } catch {
    return null;
  }
}

function signPayload(payload: string) {
  return createHmac("sha256", process.env.AUTH_SECRET || "local-dev-auth-secret").update(payload).digest("hex");
}
