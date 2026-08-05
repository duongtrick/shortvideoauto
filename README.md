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
npm.cmd run prisma:generate
npm.cmd run self-check
npm.cmd run dev
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
