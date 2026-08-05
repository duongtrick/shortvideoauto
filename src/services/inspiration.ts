const privateHostPatterns = [/^localhost$/i, /^127\./, /^10\./, /^172\.(1[6-9]|2\d|3[0-1])\./, /^192\.168\./, /^\[?::1\]?$/i];

export function normalizeInspirationUrl(input: string) {
  const url = new URL(input);
  if (url.protocol !== "https:") {
    throw new Error("Only HTTPS inspiration links are allowed.");
  }

  const host = url.hostname.toLowerCase();
  if (privateHostPatterns.some((pattern) => pattern.test(host))) {
    throw new Error("Private inspiration links are not allowed.");
  }

  url.hash = "";
  return url.toString();
}

export function summarizeInspiration(example: { hook: string | null; cta: string | null; tags: string[] }) {
  return {
    hook: example.hook ?? "",
    cta: example.cta ?? "",
    tags: example.tags,
    hasActionablePattern: Boolean(example.hook || example.cta || example.tags.length)
  };
}
