# Implementation Audit

Audit date: 2026-08-06
Repo: `duongtrick/shortvideoauto`

## Verified This Run

- Git branch `master` is clean and synced with `origin/master`.
- Existing local demo server responds `200` on `/` and `/dashboard`.
- `docker compose config` could not run because Docker CLI is not installed on this machine.
- Last feature checkpoints passed:
  - `npm.cmd run route-smoke`
  - `npm.cmd run self-check`
  - `npm.cmd run responsive-check`
  - `npm.cmd run build`
- Route smoke checkpoint added for public/auth/dashboard/account/admin routes; DB-backed read-only API routes are opt-in with `ROUTE_SMOKE_INCLUDE_DB=true`.
- Auth form inputs now enforce 16px font size inside auth CSS to prevent iOS zoom and satisfy responsive smoke at 320px.

## Done Or Foundation Implemented

### Phase 1

- Next.js App Router + TypeScript strict project exists.
- Prisma schema exists for users, jobs, videos, credits, subscriptions, payments, providers, settings, audit logs, notifications, referrals, schedules, series.
- Seed exists for demo user, admin user, default template, default AI/TTS providers, system setting.
- Shared Zod validators exist across auth, jobs, billing, captions, series, admin users/providers/subscriptions.

### Phase 2

- Product URL validation and SSRF guard exist.
- Scraper service foundation exists for Shopee/TikTok Shop style product extraction.
- AI provider chain foundation exists: Gemini, DeepSeek, OpenAI fallback.
- TTS provider chain foundation exists: FPT.AI, Viettel, Zalo, OpenAI fallback, placeholder voice fallback.
- BullMQ queue wrapper exists.
- Renderer service returns Remotion plan and FFmpeg normalize args.
- Bank payment creation, poll matching, manual confirm, refund, credit ledger entries exist.
- Email and in-app notification foundation exists, with delivery audit, retry, digest, templates, webhook status updates.
- Series automation next-run planner exists.

### Phase 3

- Remotion composition skeleton exists: `ProductShort`.
- Template marketplace foundation exists.
- Caption preview/export foundation exists.
- Thumbnail plan foundation exists.
- Music ducking plan foundation exists.
- Voice/music preview foundation exists.
- Pipeline readiness self-check exists.

### Phase 4

- Auth pages exist: login, register, forgot password, reset password, Google sign-in button.
- Dashboard foundation exists: create job, job list/search shortcuts, notification center, video library, schedule calendar, series wizard.
- Dashboard video library filter UI exists for status, source host, template, language, and date range.
- Dashboard preview workspace exists with script/product controls beside a 9:16 preview on tablet/desktop.
- Account settings/billing/notification preferences exist.
- Account referral panel exists with referral link, copy action, commission summary, and recent commission list.
- SEO landing/sample pages, sitemap, robots exist.
- Responsive CSS foundation exists: mobile-first layout, bottom nav, safe area, dark mode, reduced motion, tablet/desktop grids.
- Dashboard job list supports pull-to-refresh touch gesture on mobile.

### Phase 5

- Admin shell exists with role guard, sidebar, mobile bottom nav.
- Admin plan now ticks shell/table foundation lines without claiming full advanced admin scope.
- Admin users API/UI foundation exists.
- Admin jobs API/UI foundation exists.
- Admin videos API/UI foundation exists.
- Admin payments API/UI foundation exists.
- Admin subscriptions API/UI foundation exists.
- Admin templates API/UI foundation exists.
- Admin series API/UI foundation exists.
- Admin TTS providers API/UI foundation exists.
- Admin AI providers API/UI foundation exists.
- Admin settings API/UI foundation exists.
- Admin audit logs API/UI foundation exists.
- Admin analytics API/UI foundation exists.

## Not 100% Done

### Local Infrastructure

- Docker Compose for PostgreSQL, Redis, and MinIO now exists.
- `.env.example` now includes local MinIO endpoint and credentials.

### Core Services

- Shopee/TikTok scraping is still foundation-level, not hardened with real Playwright selectors, anti-bot/session handling, retry budget, or marketplace-specific parsing coverage.
- BullMQ worker exists, but full multi-stage queue orchestration and operational retry/dead-letter handling are not complete.
- FFmpeg execution is plan-level for some flows, not full production encode/compress pipeline everywhere.
- R2/S3/MinIO upload is signed URL/storage-key foundation, not complete object upload/download redirect flow.
- Real AI/TTS provider calls are partial; fallback paths avoid blocking demo without keys.

### Video Pipeline

- Remotion has one basic composition, not all three planned templates.
- Whisper word-level caption sync is not implemented.
- Real MP4 render + upload path needs end-to-end verification with media artifacts.

### Frontend

- Responsive smoke script now checks 320, 375, 428, 768, 1024, 1280, 1920, 2560px with installed Chrome/Edge fallback.
- Full manual/device QA is still not done for real iPhone, Android, iPad, laptop, ultra-wide.
- Full native mobile gesture QA is still pending on real devices.
- Tablet side-by-side preview foundation exists; visual QA on real iPad remains pending.
- Pricing/features pages exist only as SEO/content foundation, not full SaaS pricing funnel.
- Affiliate referral dashboard is foundation-level UI; payout settings and admin payout operations are not complete.

### Admin

- Admin modules are CRUD/foundation level, not full enterprise scope from plan:
  - no CSV export
  - no bulk actions
  - no advanced sorting
  - no full charting library
  - no right-click context menus
  - no resizable panels
  - no provider secret encryption UI
  - no real TTS/AI test calls by admin-configured provider credentials

### Testing

- Current checks are smoke/self-check/build level.
- Route smoke test exists for public routes, auth pages, protected pages, admin routes, with optional read-only API route availability when local DB services run.
- Plan target says about 230 tests; current repo does not have full unit/integration/E2E suite.
- Playwright browser binary was missing earlier, so visual responsive screenshots were not fully verified.
- Real DB-backed integration tests require `DATABASE_URL` and local services.

### Production

- No VPS deployment scripts.
- No backup/restore automation.
- No full monitoring setup.
- No security audit report.

## Next Work Order

1. Run Prisma migrate/seed against local DB.
2. Add DB-backed API smoke tests for admin/auth/billing.
3. Expand responsive checks to authenticated admin pages and orientation/touch cases.
4. Complete real R2/S3 object upload/download redirect flow.
5. Replace scraper foundation with hardened marketplace selectors and retry policy.
