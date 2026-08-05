import { z } from "zod";

const allowedHosts = [
  "shopee.vn",
  "www.shopee.vn",
  "tiktok.com",
  "www.tiktok.com",
  "shop.tiktok.com"
];

const privateHostPatterns = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^\[?::1\]?$/i
];

export const createJobInput = z.object({
  url: z.string().url().max(2048)
});

export type CreateJobInput = z.infer<typeof createJobInput>;

export function parseProductUrl(input: string) {
  const url = new URL(input);

  if (url.protocol !== "https:") {
    throw new Error("Only HTTPS product links are allowed.");
  }

  const host = url.hostname.toLowerCase();
  if (privateHostPatterns.some((pattern) => pattern.test(host))) {
    throw new Error("Private network links are not allowed.");
  }

  if (!allowedHosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))) {
    throw new Error("Only Shopee and TikTok Shop links are supported.");
  }

  url.hash = "";
  return {
    normalizedUrl: url.toString(),
    host
  };
}
