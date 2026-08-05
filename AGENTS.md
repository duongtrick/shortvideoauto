# ShortVideoAuto Agent Rules

Work in this repository only: `duongtrick/shortvideoauto`.

Source of truth:

1. Follow `implementation_plan.md`.
2. Keep MVP TypeScript full-stack: Next.js, Node worker, PostgreSQL/Prisma, Redis/BullMQ, Remotion/FFmpeg, S3/R2/MinIO.
3. Build toward Vietnamese Shopee/TikTok Shop affiliate video SaaS.

Execution rules:

- Commit after each coherent milestone.
- Push to `origin master` after each commit.
- Run `npm.cmd run self-check` before every commit.
- Run `npm.cmd run build` before pushing user-facing/API changes.
- Keep diffs small and boring.
- Do not add auto-post TikTok/Shopee in phase 1.
- Do not commit `.env`, tokens, SSH keys, cookies, or secrets.
- Prefer existing stack and stdlib before new dependencies.
- Use `ponytail:` comment when leaving deliberate MVP placeholder with clear upgrade path.

Quality gates:

- SEO pages must be server-rendered where possible.
- Dashboard and admin pages must be `noindex`.
- Product URL handling must keep SSRF protections.
- Credit ledger must remain append-only.
- Billing webhooks must verify signature before DB effects.
- Video downloads must use signed URLs.
