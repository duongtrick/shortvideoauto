# ShortVideoAuto

SaaS TypeScript full-stack tạo short video affiliate tiếng Việt từ link Shopee/TikTok Shop.

## Stack

- Next.js App Router cho landing, dashboard, API.
- PostgreSQL + Prisma cho user, job, video, credit, subscription.
- Redis + BullMQ cho queue render.
- Node.js worker cho scrape, AI script, TTS, render.
- Remotion + FFmpeg cho MP4 1080x1920.
- S3-compatible storage cho asset và video.

## Local

```powershell
npm.cmd install
Copy-Item .env.example .env
docker compose up -d postgres redis minio
npm.cmd run prisma:generate
npm.cmd run prisma:seed
npm.cmd run self-check
npm.cmd run dev
```

Responsive check needs a running app:

```powershell
npm.cmd run build
npm.cmd run start -- --port 3001
$env:RESPONSIVE_CHECK_URL="http://localhost:3001"; npm.cmd run responsive-check
```

Demo auth:

- Credentials provider accepts any valid email in local dev.
- Seeded admin email: `admin@shortvideoauto.local`.

One command on Windows:

```powershell
npm.cmd run local
```

Worker:

```powershell
npm.cmd run worker
```

## MVP

1. User dán link Shopee/TikTok Shop.
2. API validate URL, tạo job, giữ credit.
3. BullMQ đẩy job sang worker.
4. Worker scrape product, tạo 3 script tiếng Việt.
5. TTS tiếng Việt tạo audio.
6. Remotion render video 9:16.
7. FFmpeg normalize/compress.
8. Upload storage, dashboard cho download.

## Phase 2

Auto-post TikTok/Shopee sau khi có OAuth, scope, app review và Open Platform authorization.

## Planning

- `implementation_plan.md` is the full product plan.
- `PROMPT.md` is the working prompt for future agent sessions.
- `AGENTS.md` is the repo execution rule set.
