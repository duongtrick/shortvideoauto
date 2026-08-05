import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyWebhookSignature(input: {
  payload: string;
  signature: string | null;
  secret: string | undefined;
}) {
  if (!input.secret || !input.signature) return false;

  const expected = createHmac("sha256", input.secret).update(input.payload).digest("hex");
  const actual = input.signature.replace(/^sha256=/, "");

  if (expected.length !== actual.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
}
