import { randomBytes, scryptSync, timingSafeEqual, createHash } from "node:crypto";

const keyLength = 64;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, keyLength).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string | null | undefined) {
  if (!stored) return false;
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;

  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, keyLength);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function createResetToken() {
  const token = randomBytes(32).toString("base64url");
  return {
    token,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + 1000 * 60 * 30)
  };
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
