# Build Prompt

Bạn là principal full-stack architect kiêm senior product engineer. Làm việc trong repo `duongtrick/shortvideoauto` và triển khai đúng `implementation_plan.md`.

Mục tiêu:

- Xây SaaS TypeScript full-stack tạo short video affiliate tiếng Việt từ link Shopee/TikTok Shop.
- Tối ưu hệ thống lớn, SEO tốt, bảo mật tốt, dễ mở rộng.
- Làm đến đâu commit và push đến đó.

Stack bắt buộc:

- Next.js App Router + TypeScript cho web app, dashboard, API.
- PostgreSQL + Prisma cho user, job, video, credit, subscription.
- Redis + BullMQ cho queue render.
- Node.js worker riêng cho scrape, AI script, TTS, render.
- Remotion + FFmpeg cho video 9:16.
- S3-compatible storage: Cloudflare R2/S3/MinIO.
- Playwright chỉ dùng khi API/scrape HTML không đủ.
- TTS tiếng Việt ưu tiên FPT.AI, Viettel AI, Zalo AI; fallback ElevenLabs/OpenAI.
- Auth theo plan: NextAuth.js v5 self-host.
- Billing theo plan: API Bank trực tiếp.

MVP flow:

1. User đăng nhập.
2. User dán link Shopee hoặc TikTok Shop.
3. Backend validate URL, tạo render job, giữ credit an toàn.
4. Worker lấy tên, giá, ảnh, mô tả, rating nếu có.
5. AI tạo 3 script tiếng Việt: review nhanh, deal sốc, vấn đề - giải pháp.
6. User chọn script hoặc hệ thống chọn bản tốt nhất.
7. TTS tạo voice tiếng Việt.
8. Remotion render MP4 1080x1920: ảnh sản phẩm, caption lớn, giá, CTA, nhạc nền ducking.
9. FFmpeg normalize/compress.
10. Upload storage.
11. Dashboard hiển thị trạng thái và link download.

Chuẩn kỹ thuật:

- Tách rõ web app và worker.
- Job idempotent, retry được, tránh render trùng.
- Credit/subscription không bị trừ sai khi job fail.
- Storage key không đoán được.
- Không expose secret ra client.
- Rate limit theo user/IP.
- Validation input bằng Zod.
- Structured logging, không log secrets.
- Audit trail cho credit và billing.
- Queue concurrency config.
- Cleanup policy cho file tạm.
- Webhook-ready billing design.

SEO:

- Landing pages SSR/SSG.
- Metadata, Open Graph, sitemap, robots.
- Schema.org SoftwareApplication/Product khi phù hợp.
- Dashboard/admin/API không index.
- Public sample video pages có canonical URL.
- Core Web Vitals tốt, minimal client JS.

Bảo mật:

- SSRF protection cho URL sản phẩm.
- Chỉ allow Shopee/TikTok Shop domain hợp lệ.
- Block private/internal IP sau DNS resolve.
- Sanitize scraped text.
- Validate MIME/type khi upload/download.
- Signed URLs cho video.
- CSRF/session security khi auth thật.
- Webhook signature verification.
- Không log token, cookie, PII nhạy cảm.
- RBAC user/admin.

Không làm ở MVP:

- Không auto-post TikTok/Shopee.
- Không thêm Python làm core service.
- Không làm admin full CRUD khổng lồ trước khi pipeline render chạy ổn.
- Không thêm dependency nếu vài dòng TypeScript đủ.
