# Security Checklist

- Validate product links with Zod.
- Allow HTTPS only.
- Allow Shopee/TikTok Shop hostnames only.
- Block localhost and private network hostnames before scraper.
- Resolve product host DNS and block private/internal IPs before network scrape.
- Keep secrets in `.env`, never client bundle.
- Use signed URLs for private video downloads.
- Verify billing webhook signatures before credit changes.
- Billing webhook stores idempotent raw events before subscription/credit handlers expand.
- Do not log tokens, cookies, raw payment payload secrets, or TTS credentials.
- Structured logs include IDs and events only.
- Sanitize scraped product text before prompts/templates.
- Store credit changes in append-only ledger.
- Refund render credit in the same transaction that marks worker failure.
- Protect admin routes with role check.
- Current auth boundary is demo-only; replace `getCurrentUser` with NextAuth/Clerk before launch.
- Add rate limit per user/IP before public launch.
- Current MVP has in-memory API rate limit. Move it to Redis before multi-instance deploy.

## Threat Model

Main MVP risks:

- SSRF through submitted product URL.
- Credit double-charge or refund mismatch.
- Queue duplicate render.
- Scraper leaking cookies or internal HTML.
- Public video URL guessing.
- Billing webhook spoofing.
