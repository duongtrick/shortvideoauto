# Architecture

```mermaid
flowchart TD
  A["Next.js UI"] --> B["POST /api/jobs"]
  B --> C["PostgreSQL + Prisma"]
  B --> D["BullMQ render queue"]
  D --> E["Node.js worker"]
  E --> F["Scraper"]
  E --> G["AI script"]
E --> H["Vietnamese TTS"]
E --> I["Remotion render"]
I --> J["FFmpeg normalize"]
  J --> K["S3/R2/MinIO storage"]
  K --> L["Download MP4"]
```

## Job State

`queued`, `scraping`, `scripting`, `tts`, `rendering`, `uploading`, `completed`, `failed`.

Jobs use BullMQ `jobId = RenderJob.id` so retries do not create duplicate queue entries. Credit hold is created in the same DB transaction as the job.

Render service now builds a deterministic Remotion plan and FFmpeg normalize args. Real media execution stays behind that service.

AI script service tries Gemini, then DeepSeek, then OpenAI. Missing keys fall back to deterministic Vietnamese drafts.

TTS service tries FPT.AI, then Viettel, then Zalo, then OpenAI-compatible fallback. Missing keys fall back to placeholder voice assets.

Bank billing uses unique payment codes, token-protected poll endpoint, transaction matching, and credit ledger grant in one DB transaction.

Admin stats endpoint aggregates users, jobs, videos, paid payments, revenue, and credits sold behind admin role guard.

Admin job API lists jobs by status and can requeue failed jobs with audit logging.

Admin payment API lists payments and supports manual confirmation with credit ledger grant plus audit log.

Middleware resolves tenant domain from host and exposes tenant headers for future multi-domain branding.

Schema includes admin-managed VideoTemplate, TTSProvider, AIProvider, and SystemSetting models.

Video library API filters user videos by render status, source host, series, template, language, and date range. It returns signed download URLs.

Schedule API stores per-platform planned posts with caption, hashtags, scheduled time, and manual publish checklist for platforms without approved posting APIs.

TikTok calculator estimates engagement, post value range, and affiliate potential from user-supplied metrics.

Referral API creates stable referral links and stores pending/paid affiliate commissions for the SaaS affiliate program.

Admin settings API reads by group and upserts validated setting values with audit logging.

Admin template API can list, create, update, and disable video templates with audit logging.

## Deliberate MVP Limits

- No auto-post.
- No real billing webhook until product flow works.
- No scraper bypass for private/internal URLs.
- No Python core service.
