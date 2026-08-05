# Shopee/TikTok Affiliate Video Generator — SaaS Platform (v4)

Hệ thống SaaS full-stack TypeScript tạo video affiliate 9:16 tự động cho thị trường Việt Nam. User dán link sản phẩm Shopee/TikTok Shop → hệ thống scrape → AI viết kịch bản tiếng Việt → TTS → Remotion render video MP4 1080×1920.

## Decisions Confirmed

| Câu hỏi | Quyết định |
|----------|------------|
| AI Model | **Gemini Flash FREE** (primary) + **DeepSeek V3** (rẻ) + GPT-4o-mini (fallback) |
| Hosting | Local dev → VPS production |
| Storage | Cloudflare R2 (egress free) |
| Billing | **API Bank trực tiếp** (thueapibank.vn) |
| Auth | NextAuth.js v5 self-host |
| Domain | Multi-domain support |
| FE Quality | **TasteSkill v2** — anti-slop design rules |
| Admin | **Full CRUD** — 11 module quản trị |
| Testing | 100% coverage — ~245 test cases |

---

## TasteSkill Integration — FE Design Quality

### Setup

```bash
# Install taste-skill v2 (default) + output-skill vào project
npx taste-skill@latest            # Tạo .agents/skills/design-taste-frontend/SKILL.md
npx taste-skill@latest --skill output-skill  # Anti-placeholder rules
```

### Skills sử dụng

| Skill | Mục đích |
|-------|----------|
| `design-taste-frontend` (v2) | Core — brief inference, design system map, anti-slop bans, pre-flight check |
| `output-skill` | Anti-laziness — block placeholder comments, skipped sections, half-finished output |
| `soft-skill` | Cho marketing pages — calm, polished, whitespace, smooth motion |

### SKILL.md customization cho dự án

```markdown
# Project-specific overrides (đặt đầu SKILL.md)

## Brand Direction
- Vietnamese SaaS for affiliate content creators
- Primary accent: #FF6B35 (Shopee-inspired warm orange)
- Secondary: #00B4D8 (teal for TikTok feel)
- Mood: energetic but professional, creator-friendly
- Audience: Vietnamese affiliate marketers, 20-35 tuổi
- Typography: Inter (UI) + Lexend (headings) — Google Fonts
- Motion: subtle, purposeful — no flashy for the sake of flashy
- Dark mode: ON by default (creators work at night)

## Design Rules
- Dashboard: data-dense, Linear/Notion-inspired
- Marketing pages: bold typography, asymmetric grids
- No AI-purple gradients (banned by taste-skill)
- No three-equal-card rows (banned by taste-skill)
- Vietnamese text first — all UI copy in Vietnamese
- QR code payment flow must feel native, not foreign
```

### TasteSkill enforces (tự động):

```
✅ Brief inference — đọc context trước khi generate
✅ Color consistency lock — 1 accent xuyên suốt
✅ Shape consistency lock — 1 border-radius system
✅ Dark mode protocol — dual-mode, WCAG AA contrast
✅ Anti-slop bans:
   - No em-dashes/en-dashes
   - No section-numbering eyebrows (00 / INDEX)
   - No hero version labels (BETA, V0.6)
   - No three-equal-card feature rows
   - No AI-purple mesh gradients
   - No fake div-based product UI
   - No scroll cues / down arrows
   - No window.addEventListener('scroll')
✅ Pre-flight check — every checkbox pass before ship
✅ Output-skill — no placeholder comments, no //TODO, complete output
```

---

## Responsive & Adaptive Design — All Devices

### Responsive Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| Mobile Small | 320px | iPhone SE, điện thoại cũ |
| Mobile | 375px-428px | iPhone 14/15, Samsung Galaxy |
| Tablet Portrait | 768px | iPad Mini, iPad Air |
| Tablet Landscape | 1024px | iPad Pro landscape |
| Desktop | 1280px-1440px | Laptop 13-15 inch |
| Desktop Large | 1920px | Monitor Full HD |
| Desktop XL | 2560px | Monitor 2K/4K |

### Thiết bị cần test và tối ưu

- iPhone SE (320px) đến iPhone 15 Pro Max (430px)
- Samsung Galaxy S series, A series
- iPad Mini, iPad Air, iPad Pro 11 inch và 12.9 inch
- Laptop 13 inch, 14 inch, 15 inch, 16 inch
- Monitor 24 inch Full HD, 27 inch 2K, 32 inch 4K
- Màn hình ultra-wide 21:9

### Mobile-First Design

- Tất cả CSS viết mobile-first bằng `min-width` breakpoints.
- Touch targets tối thiểu 44x44px theo Apple HIG.
- Swipe gestures cho carousel và video preview.
- Bottom navigation cho dashboard trên mobile.
- Sticky CTA buttons trên mobile.
- Font size input tối thiểu 16px để tránh iOS zoom.
- Safe area insets cho iPhone notch và Dynamic Island.
- Pull-to-refresh cho job list.
- Sheet hoặc bottom drawer thay modal trên mobile.

### Tablet Optimization

- Split-view layout cho dashboard: sidebar + content.
- Grid layouts: 2 columns tablet, 3-4 columns desktop.
- Admin panel có collapsible sidebar, dùng tốt trên iPad.
- Video preview side-by-side với script trên tablet landscape.

### Desktop Enhancement

- Keyboard shortcuts: `Ctrl+N` tạo job, `Ctrl+K` search.
- Hover states và tooltips.
- Multi-column layouts tận dụng không gian.
- Drag-and-drop cho template sort và file upload.
- Context menus cho right-click.
- Resizable panels trong admin dashboard.

### Performance Per Device

- Lazy load images bằng `next/image` và `loading="lazy"`.
- Responsive images với `srcset` và `sizes`.
- Video dùng poster image, lazy load player.
- `prefers-reduced-motion` media query.
- Dark mode tự nhận `prefers-color-scheme`.
- Connection-aware: giảm quality trên slow network bằng `navigator.connection`.
- Touch vs pointer detection để điều chỉnh UI.

### Typography Scale

- Fluid typography dùng `clamp()` cho headings.
- Body: 14px mobile đến 16px desktop.
- H1: 28px mobile đến 48px desktop.
- Line height: 1.5 body, 1.2 headings.
- Vietnamese text phải đủ line-height để dấu không bị cắt.

### Navigation Patterns

- Mobile: hamburger menu + bottom tab bar.
- Tablet: collapsible sidebar.
- Desktop: persistent sidebar + breadcrumbs.
- Admin mobile: bottom sheet navigation, không ẩn chức năng.

### Forms & Input

- Stacked labels trên mobile, inline trên desktop.
- Input type đúng: `tel`, `email`, `url`, `number`.
- Auto-complete attributes.
- Paste detection cho URL input trên mobile clipboard.
- Camera/gallery picker cho mobile upload.

### Dashboard Responsive

- KPI cards: 1 column mobile, 2 tablet, 4 desktop.
- Charts: full-width mobile, grid desktop.
- Tables: horizontal scroll mobile hoặc card view.
- Admin tables: card layout trên mobile, table desktop.

### Video Player Responsive

- 9:16 `aspect-ratio` container.
- Fullscreen support mobile.
- Picture-in-Picture desktop.
- Download button accessible mọi size.

### CSS Architecture

- CSS custom properties cho responsive spacing và sizing.
- Container queries cho component-level responsive, không chỉ viewport.
- Logical properties: inline/block thay left/right.
- Native CSS `aspect-ratio`.
- Grid + flexbox, không dùng float.
- Không horizontal overflow trên bất kỳ viewport nào.

### Integration Requirements

1. Phase 4 design system phải áp dụng toàn bộ responsive/adaptive rules.
2. Mọi component UI phải có mobile, tablet, desktop states.
3. Phase 5 admin panel phải dùng được đầy đủ trên mobile/tablet/desktop.
4. Test plan thêm khoảng 15 responsive tests.
5. Cross-device testing checklist bắt buộc trước deploy.

---

## Competitive Feature Audit — Missing Ideas Only

Audit scope ngày 2026-08-06:

- `autoshorts.ai`: landing, login, pricing/FAQ sections rendered by browser, public footer pages listed.
- `autoshort.io/vi`: homepage, feature/pricing anchors, blog, affiliate, footer resources. Help/tutorial public routes returned 404 at audit time.
- `short.ai/vi`: homepage, faceless video, social scheduler, TikTok money calculator, TikTok transcript/script generator, pricing, caption generator, Reddit to video, dialogue video, short story generator, fake text message video, animated video maker, Minecraft parkour video, long-video-to-short-video, YouTube-to-TikTok converter.
- Account-gated pages checked: `short.ai/vi/explore`, `short.ai/vi/create/*`. They redirect/render login, so internal dashboard workflow requires test account/email verification in a later audit.

### Features Already Covered — Keep Current Plan

- Auth, Google login, forgot password.
- AI script generation.
- Vietnamese TTS provider chain.
- Remotion/FFmpeg 9:16 render.
- Caption overlay and music ducking in video pipeline.
- Queue, credit ledger, billing, dashboard, admin foundation.
- Phase 2 social auto-post after OAuth/API approval.

### New Feature Ideas To Add

#### Series Automation

- `ContentSeries` model: topic, niche, platform targets, cadence, language, style, template, voice, music, default CTA.
- Series wizard: create once, generate many videos over time.
- Daily/weekly posting cadence: 3 times/week, once/day, twice/day.
- Series-level queue: generate next video automatically while respecting credit/subscription limits.
- Series replacement flow: archive old series and start a new one without losing analytics.

#### Creator Scheduler

- Calendar view for scheduled videos across TikTok, YouTube Shorts, Instagram Reels, Facebook, X/Twitter, LinkedIn, Pinterest.
- Bulk scheduling from video library.
- Per-platform caption/title/hashtag fields.
- AI caption/hashtag suggestions per platform.
- Best-time recommendation based on historical performance.
- Manual publish checklist for platforms without API approval.

#### Video Library Enhancements

- Project library with filters: platform, status, template, product source, series, date, language.
- Preview before posting.
- Edit script, title, images, music, voice, CTA before render/post.
- Download all assets: MP4, thumbnail, voiceover, captions, metadata JSON.
- Ownership/export guarantee: user can download and keep generated videos.

#### Template And Style Marketplace

- Preset styles inspired by observed market categories: UGC hook, vlog, fitness, stories, anime, comic, cartoon, cinematic, Pixar-like 3D, manga, Minecraft/parkour, GTA-style, children-book style.
- Template preview gallery with sample output.
- Style-level defaults: caption preset, image model, transition pack, music pack, voice.
- Template A/B testing by series.

#### Caption Studio

- More than basic captions: multiple animated caption presets, emoji/GIF highlights, word emphasis, brand colors, font controls.
- Import transcript from uploaded video or pasted TikTok/YouTube URL.
- Export SRT/VTT alongside burned-in captions.
- Multi-language transcription and translation.
- Caption accuracy QA step before render.

#### Long Video Repurposing

- Upload long video or paste YouTube URL.
- AI detects hooks, insights, reactions, product mentions, and affiliate-friendly moments.
- Create 10+ short clips from one source.
- Keyword-guided clipping: include moments matching user keywords.
- Auto-reframe to 9:16 and add captions/title.

#### Social Proof And Trend Tools

- TikTok account estimator/calculator: followers, likes, engagement, estimated revenue.
- Competitor/ad inspiration board: save public examples and annotate hook/CTA/template.
- Public explore gallery for examples and templates, with moderation.
- Niche trend tracker for affiliate categories.

#### Faceless Content Modes

- Reddit/story-to-video mode for non-product content funnels.
- Fake text message/chat video generator.
- Dialogue video generator with selectable characters and voices.
- Short story generator for narrative affiliate hooks.
- Animated video maker for text-to-animation prompts.
- Background libraries: Minecraft parkour, satisfying videos, unboxing loops, gameplay loops, abstract motion.

#### Voice And Audio Advanced

- Voice cloning as paid/premium feature after legal consent flow.
- Voice library by language/accent/emotion/use case.
- Background music library with copyright-safe tags.
- Music ducking presets: soft, normal, aggressive.
- Audio preview before render.

#### Pricing And Credit Packaging

- Plan limits by monthly credits, upload size, video count, voice tier, auto-post access.
- Motion credits separated from render credits for expensive animated/image-model scenes.
- Free plan can create limited preview/watermarked output.
- Upgrade/downgrade flow and plan comparison.

#### Affiliate Program For This SaaS

- Built-in referral program for ShortVideoAuto users.
- Referral link, cookie window, recurring commission, payout threshold.
- Affiliate dashboard: clicks, trials, paid conversions, commission pending/paid.

#### Compliance And Platform Safety

- Content policy checks before render/post: banned topics, platform-sensitive claims, affiliate disclosure.
- Auto-insert affiliate disclosure text/voice if enabled.
- Google/TikTok/YouTube API disclosure pages and connected-account permission center.
- Per-platform posting readiness checklist.

### Product Priority

1. Series Automation + Video Library Enhancements.
2. Caption Studio.
3. Creator Scheduler.
4. Template And Style Marketplace.
5. Long Video Repurposing.
6. TikTok account estimator and trend tools.
7. Voice cloning and advanced audio.
8. Affiliate program for this SaaS.

### Audit Follow-Up

- Create test accounts only with a dedicated project email and owner-approved credentials.
- Re-audit account-gated dashboards after login works on each platform.
- Record onboarding steps, internal navigation, export limits, and billing gates.
- Do not copy UI, copy, assets, prompts, or protected workflows. Extract only product ideas and adapt to Vietnamese affiliate use case.

---

## Admin Panel — Full CRUD (11 Modules)

> [!IMPORTANT]
> Admin panel quản trị **mọi thứ** trong hệ thống. Mục tiêu: admin không bao giờ phải sửa code hay vào database trực tiếp. Mọi thao tác đều qua UI.

### Routes

```
apps/web/src/app/(admin)/admin/
├── layout.tsx                    # Admin sidebar + topbar
├── page.tsx                      # Analytics dashboard (home)
├── users/
│   ├── page.tsx                  # User list + search + filter
│   ├── create/page.tsx           # Create user form
│   └── [id]/
│       ├── page.tsx              # User detail + edit
│       └── jobs/page.tsx         # User's jobs
├── jobs/
│   ├── page.tsx                  # All jobs + filter + search
│   └── [id]/page.tsx             # Job detail + actions
├── videos/
│   └── page.tsx                  # Video library + storage stats
├── payments/
│   ├── page.tsx                  # Payment list + reconciliation
│   └── [id]/page.tsx             # Payment detail
├── subscriptions/
│   └── page.tsx                  # Subscription management
├── templates/
│   ├── page.tsx                  # Video template list
│   ├── create/page.tsx           # Create template
│   └── [id]/page.tsx             # Edit template
├── tts/
│   └── page.tsx                  # TTS provider/voice management
├── ai-providers/
│   └── page.tsx                  # AI provider management
├── settings/
│   └── page.tsx                  # System settings
└── audit-logs/
    └── page.tsx                  # Audit log viewer
```

### API Routes

```
apps/web/src/app/api/admin/
├── users/
│   ├── route.ts                  # GET list, POST create
│   └── [id]/
│       ├── route.ts              # GET, PATCH update, DELETE
│       ├── credits/route.ts      # PATCH adjust credits
│       ├── ban/route.ts          # POST ban/unban
│       ├── reset-password/route.ts # POST reset
│       └── role/route.ts         # PATCH change role
├── jobs/
│   ├── route.ts                  # GET list (all users)
│   └── [id]/
│       ├── route.ts              # GET, DELETE
│       ├── retry/route.ts        # POST retry failed
│       ├── cancel/route.ts       # POST cancel
│       └── priority/route.ts     # PATCH set priority
├── videos/
│   ├── route.ts                  # GET list
│   └── [id]/route.ts             # DELETE
├── payments/
│   ├── route.ts                  # GET list
│   ├── export/route.ts           # GET CSV export
│   └── [id]/
│       ├── confirm/route.ts      # POST manual confirm
│       └── refund/route.ts       # POST refund
├── subscriptions/
│   ├── route.ts                  # GET list
│   └── [id]/route.ts             # PATCH update, DELETE cancel
├── templates/
│   ├── route.ts                  # GET list, POST create
│   └── [id]/route.ts             # GET, PATCH update, DELETE
├── tts/
│   ├── route.ts                  # GET list, POST add
│   ├── [id]/route.ts             # PATCH, DELETE
│   └── test/route.ts             # POST test voice
├── ai-providers/
│   ├── route.ts                  # GET list, POST add
│   ├── [id]/route.ts             # PATCH, DELETE
│   └── test/route.ts             # POST test provider
├── settings/
│   └── route.ts                  # GET, PATCH
├── audit-logs/
│   ├── route.ts                  # GET list + search
│   └── export/route.ts           # GET CSV export
└── stats/
    ├── route.ts                  # GET dashboard stats
    ├── revenue/route.ts          # GET revenue chart data
    └── usage/route.ts            # GET usage chart data
```

---

### Module 1: User Management

```
Chức năng:
┌────────────────────────┬──────────────────────────────────────────┐
│ Feature                │ Detail                                   │
├────────────────────────┼──────────────────────────────────────────┤
│ List users             │ Table: avatar, name, email, plan, credits│
│                        │ credits, status, joined date             │
│ Search                 │ By email, name (debounced)               │
│ Filter                 │ By plan, status (active/banned), role    │
│ Sort                   │ By date, credits, name                   │
│ Pagination             │ 20/page, cursor-based                    │
│ Create user            │ Form: email, name, password, role, plan  │
│ Edit user              │ Inline edit: name, email, role           │
│ Delete user            │ Soft delete, confirm dialog, cascade jobs│
│ Reset password         │ Generate temp password, force change     │
│ Ban / Unban            │ Toggle, reason field, audit logged       │
│ Change role            │ USER ↔ ADMIN, confirm dialog             │
│ Adjust credits         │ Add/subtract, reason field, audit logged │
│ View user jobs         │ Link to filtered job list                │
│ View user payments     │ Link to filtered payment list            │
│ Export                 │ CSV: all users or filtered               │
└────────────────────────┴──────────────────────────────────────────┘
```

### Module 2: Job Management

```
┌────────────────────────┬──────────────────────────────────────────┐
│ Feature                │ Detail                                   │
├────────────────────────┼──────────────────────────────────────────┤
│ List all jobs          │ Table: ID, user, URL, status, progress,  │
│                        │ template, created, duration              │
│ Search                 │ By job ID, product URL, user email       │
│ Filter                 │ By status, platform, template, date range│
│ Sort                   │ By date, status, user                    │
│ View detail            │ Product data, scripts, TTS, video preview│
│ Retry failed           │ Re-queue from failed stage               │
│ Cancel running         │ Kill active queue job, set FAILED        │
│ Delete job             │ Soft delete, remove from queue           │
│ Bulk delete            │ Checkbox select, confirm, batch delete   │
│ Set priority           │ 1-10, higher = process first             │
│ View queue status      │ BullMQ dashboard: waiting/active/failed  │
│ Export                 │ CSV: filtered jobs                       │
└────────────────────────┴──────────────────────────────────────────┘
```

### Module 3: Video Management

```
┌────────────────────────┬──────────────────────────────────────────┐
│ Feature                │ Detail                                   │
├────────────────────────┼──────────────────────────────────────────┤
│ List all videos        │ Grid/table: thumbnail, title, user,      │
│                        │ duration, size, date                     │
│ Preview                │ In-browser video player                  │
│ Delete video           │ Remove from DB + R2 storage              │
│ Bulk delete            │ Checkbox select, batch delete            │
│ Storage stats          │ Total size, count, by user, by month     │
│ Download               │ Admin can download any video             │
│ Regenerate thumbnail   │ Re-extract thumbnail from video          │
└────────────────────────┴──────────────────────────────────────────┘
```

### Module 4: Payment Management

```
┌────────────────────────┬──────────────────────────────────────────┐
│ Feature                │ Detail                                   │
├────────────────────────┼──────────────────────────────────────────┤
│ List payments          │ Table: code, user, amount, status, bank, │
│                        │ txn ID, date                             │
│ Search                 │ By payment code, txn ID, user email      │
│ Filter                 │ By status, date range, amount range      │
│ Manual confirm         │ For stuck payments — enter bank txn ID   │
│ Refund                 │ Mark refunded, reverse credits/plan      │
│ Bank reconciliation    │ Side-by-side: bank txns vs pending       │
│                        │ payments, manual match                   │
│ Export CSV             │ Filtered payments for accounting         │
│ Revenue stats          │ Daily/weekly/monthly, by plan            │
│ Pending alerts         │ Count of pending > 30min (highlight)     │
└────────────────────────┴──────────────────────────────────────────┘
```

### Module 5: Subscription Management

```
┌────────────────────────┬──────────────────────────────────────────┐
│ Feature                │ Detail                                   │
├────────────────────────┼──────────────────────────────────────────┤
│ List subscriptions     │ Table: user, plan, status, period end    │
│ Filter                 │ By plan, status                          │
│ Upgrade / Downgrade    │ Change plan, prorate credits             │
│ Cancel                 │ Set status CANCELLED, keep until period  │
│ Extend period          │ Add days to currentPeriodEnd             │
│ Bulk operations        │ Bulk cancel expired, bulk extend         │
│ Expiring soon alert    │ List subs expiring in 7 days             │
└────────────────────────┴──────────────────────────────────────────┘
```

### Module 6: Template Management

```
┌────────────────────────┬──────────────────────────────────────────┐
│ Feature                │ Detail                                   │
├────────────────────────┼──────────────────────────────────────────┤
│ List templates         │ Card grid: preview, name, plan required  │
│ Create template        │ Form: name, description, thumbnail,      │
│                        │ plan requirement (free/basic/pro),        │
│                        │ composition ID, config JSON               │
│ Edit template          │ Update all fields                        │
│ Delete template        │ Soft delete, check no active jobs using  │
│ Preview                │ Sample render with test data             │
│ Enable / Disable       │ Toggle availability without deleting     │
│ Sort order             │ Drag-and-drop reorder                    │
│ Duplicate              │ Clone template with new name             │
│ Config editor          │ JSON editor for template variables:      │
│                        │ colors, fonts, animation speeds,         │
│                        │ scene durations, music track             │
└────────────────────────┴──────────────────────────────────────────┘

Prisma model:
model Template {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?
  thumbnail   String?
  compositionId String  // Remotion composition ID
  config      Json     // colors, fonts, timing, etc.
  minPlan     Plan     @default(FREE)
  enabled     Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([enabled, sortOrder])
}
```

### Module 7: TTS Voice Management

```
┌────────────────────────┬──────────────────────────────────────────┐
│ Feature                │ Detail                                   │
├────────────────────────┼──────────────────────────────────────────┤
│ List providers         │ Table: name, type, status, voice count   │
│ Add provider           │ Form: name, API URL, API key, type       │
│ Edit provider          │ Update URL, key, priority                │
│ Delete provider        │ Remove (check no active jobs using)      │
│ Enable / Disable       │ Toggle without deleting                  │
│ Set priority           │ Drag order for fallback chain            │
│ List voices per provider│ Table: voice ID, name, gender, region   │
│ Add voice              │ Form: voiceId, name, gender, language    │
│ Edit voice             │ Update name, enabled status              │
│ Delete voice           │ Remove from available options            │
│ Test voice             │ Input text → play audio preview          │
│ Usage stats            │ Chars used per provider, cost estimate   │
└────────────────────────┴──────────────────────────────────────────┘

Prisma models:
model TTSProvider {
  id        String   @id @default(cuid())
  name      String   @unique
  type      String   // fpt_ai, viettel_ai, zalo_tts, openai_tts
  apiUrl    String
  apiKey    String   // encrypted
  enabled   Boolean  @default(true)
  priority  Int      @default(0)
  config    Json?    // extra provider-specific config
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  voices    TTSVoice[]
  @@index([enabled, priority])
}

model TTSVoice {
  id         String   @id @default(cuid())
  providerId String
  voiceId    String   // provider's voice identifier
  name       String   // display name: "Ban Mai (nữ Bắc)"
  gender     String   // male, female
  language   String   @default("vi-VN")
  region     String?  // north, central, south
  enabled    Boolean  @default(true)
  sampleUrl  String?  // preview audio URL

  provider   TTSProvider @relation(fields: [providerId], references: [id])
  @@unique([providerId, voiceId])
}
```

### Module 8: AI Provider Management

```
┌────────────────────────┬──────────────────────────────────────────┐
│ Feature                │ Detail                                   │
├────────────────────────┼──────────────────────────────────────────┤
│ List providers         │ Table: name, model, tier, status, usage  │
│ Add provider           │ Form: name, API URL, API key, model,     │
│                        │ tier (free/cheap/premium)                │
│ Edit provider          │ Update all fields                        │
│ Delete provider        │ Remove from chain                        │
│ Set priority           │ Drag order for fallback chain            │
│ Enable / Disable       │ Toggle availability                      │
│ Test provider          │ Send test prompt → verify response       │
│ Usage stats            │ Tokens used, cost estimate, error rate   │
│ Rate limit config      │ RPM, TPD limits per provider             │
│ Cost tracking          │ Daily/monthly cost per provider          │
│ Prompt templates       │ Edit system prompts for each script style│
│ Model parameters       │ Temperature, max_tokens, top_p per model │
└────────────────────────┴──────────────────────────────────────────┘

Prisma model:
model AIProvider {
  id           String   @id @default(cuid())
  name         String   @unique
  type         String   // gemini, deepseek, openai
  model        String   // gemini-2.0-flash, deepseek-chat, gpt-4o-mini
  apiUrl       String
  apiKey       String   // encrypted
  tier         String   @default("free") // free, cheap, premium
  enabled      Boolean  @default(true)
  priority     Int      @default(0)
  rpmLimit     Int?     // requests per minute
  tpdLimit     Int?     // tokens per day
  temperature  Float    @default(0.7)
  maxTokens    Int      @default(2000)
  config       Json?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([enabled, priority])
}
```

### Module 9: System Settings

```
┌────────────────────────┬──────────────────────────────────────────┐
│ Feature                │ Detail                                   │
├────────────────────────┼──────────────────────────────────────────┤
│ Site info              │ Site name, tagline, logo, favicon        │
│ Contact info           │ Email, phone, address                    │
│ Email templates        │ Welcome, verify, reset password,         │
│                        │ payment confirm, job done                │
│ Bank account info      │ Bank name, account number, holder name   │
│                        │ (shown on payment page)                  │
│ API keys display       │ Masked view of all external API keys     │
│ Rate limits            │ Global + per-plan rate limits config     │
│ Credit config          │ Free credits, monthly reset, pricing     │
│ Plan config            │ Plan names, prices, features, credits    │
│ Maintenance mode       │ Toggle on/off, custom message            │
│ Domain management      │ Add/edit/delete domains, brand per domain│
│ Storage config         │ R2 bucket, region, limits                │
│ Queue config           │ Concurrency, timeout, retry per queue    │
│ Scraper config         │ Proxy settings, user-agent rotation,     │
│                        │ selector versions for Shopee/TikTok      │
│ Feature flags          │ Toggle features without deploy           │
│ Watermark settings     │ Enable/disable, image, position, opacity │
│ Music library          │ Upload/manage background music tracks    │
│ Social links           │ Footer social media links                │
│ SEO defaults           │ Default meta title, description, OG image│
└────────────────────────┴──────────────────────────────────────────┘

Prisma model:
model SystemSetting {
  id    String @id @default(cuid())
  key   String @unique    // "site_name", "maintenance_mode", etc.
  value Json              // flexible value storage
  group String @default("general") // general, billing, email, queue, etc.
  
  @@index([group])
}
```

### Module 10: Audit Logs

```
┌────────────────────────┬──────────────────────────────────────────┐
│ Feature                │ Detail                                   │
├────────────────────────┼──────────────────────────────────────────┤
│ List logs              │ Table: time, user, action, entity, IP    │
│ Search                 │ By user, action, entity ID               │
│ Filter                 │ By action type, date range, user         │
│ Detail view            │ Full metadata JSON, before/after diff    │
│ Export CSV             │ Filtered logs for compliance             │
│ Retention config       │ Auto-delete logs older than X days       │
│ Real-time stream       │ SSE feed of live admin actions           │
└────────────────────────┴──────────────────────────────────────────┘

Logged actions:
- user.create, user.update, user.delete, user.ban, user.unban
- user.role_change, user.credit_adjust, user.reset_password
- job.create, job.delete, job.retry, job.cancel
- video.delete
- payment.manual_confirm, payment.refund
- subscription.update, subscription.cancel
- template.create, template.update, template.delete
- tts_provider.create, tts_provider.update, tts_provider.delete
- ai_provider.create, ai_provider.update, ai_provider.delete
- settings.update
- admin.login, admin.logout
```

### Module 11: Analytics Dashboard

```
┌────────────────────────┬──────────────────────────────────────────┐
│ Feature                │ Detail                                   │
├────────────────────────┼──────────────────────────────────────────┤
│ KPI Cards              │ Total users, active today, total revenue │
│                        │ this month, videos today, queue depth    │
│ User growth chart      │ Line chart: daily signups (30/90 days)   │
│ Revenue chart          │ Bar chart: daily/monthly revenue         │
│ Job volume chart       │ Line: jobs created vs completed per day  │
│ Pipeline performance   │ Avg time per stage (scrape/AI/TTS/render)│
│ Error rate chart       │ Failed jobs % over time                  │
│ Provider usage         │ Pie: AI/TTS provider distribution       │
│ Template popularity    │ Bar: videos per template                 │
│ Plan distribution      │ Pie: users per plan                     │
│ Top users              │ Table: most active users by video count  │
│ Storage usage          │ Gauge: used vs available                 │
│ System health          │ CPU, RAM, disk, Redis, PostgreSQL status │
│ Date range picker      │ Filter all charts by custom date range  │
│ Export                 │ Download charts as PNG, data as CSV      │
└────────────────────────┴──────────────────────────────────────────┘
```

---

## AI Model Strategy — Tối Ưu Chi Phí

### Provider chain (ưu tiên free/rẻ)

```
Tier 1 — FREE:
├── Gemini 2.0 Flash     ← PRIMARY — 15 RPM, 1M TPD FREE
└── Gemini 1.5 Flash     ← BACKUP FREE

Tier 2 — CHEAP:
├── DeepSeek V3           ← $0.27/1M input
└── GPT-4o-mini           ← $0.15/1M input

Tier 3 — PREMIUM (enterprise users):
├── DeepSeek R1           ← $0.55/1M
└── GPT-4o                ← $2.50/1M

Chi phí/video: 0đ (free tier) → ~23 VND (DeepSeek) → max ~250 VND (GPT-4o)
Tất cả provider quản lý qua Admin UI — thêm/sửa/xóa/test không cần sửa code.
```

---

## Billing — API Bank

```
Flow: User chuyển khoản → ghi nội dung mã CTF5XXXXXX → 
      Cron poll thueapibank.vn mỗi 15s → auto match → credit user

Bank info quản lý qua Admin Settings — đổi số tài khoản không cần deploy.
QR code VietQR auto-generate.
Manual confirm trong Admin nếu auto-match fail.
```

---

## Updated Prisma Schema (new models)

```prisma
// Thêm vào schema.prisma ngoài User/Job/Video/Payment/Subscription/AuditLog:

model Template { ... }         // Module 6
model TTSProvider { ... }      // Module 7
model TTSVoice { ... }         // Module 7
model AIProvider { ... }       // Module 8
model SystemSetting { ... }    // Module 9
```

---

## Project Structure (updated)

```
CTF5/
├── .agents/
│   └── skills/
│       ├── design-taste-frontend/    # TasteSkill v2 — auto-installed
│       │   └── SKILL.md
│       └── output-skill/             # Anti-placeholder — auto-installed
│           └── SKILL.md
├── apps/
│   ├── web/
│   │   └── src/app/
│   │       ├── (auth)/               # Login, register, forgot-password
│   │       ├── (dashboard)/          # User dashboard, create, jobs, videos, billing
│   │       ├── (admin)/admin/        # ⭐ 11 admin modules
│   │       │   ├── users/
│   │       │   ├── jobs/
│   │       │   ├── videos/
│   │       │   ├── payments/
│   │       │   ├── subscriptions/
│   │       │   ├── templates/
│   │       │   ├── tts/
│   │       │   ├── ai-providers/
│   │       │   ├── settings/
│   │       │   ├── audit-logs/
│   │       │   └── page.tsx          # Analytics dashboard
│   │       ├── (marketing)/          # Landing, pricing, features
│   │       └── api/
│   │           ├── admin/            # ⭐ All admin CRUD endpoints
│   │           ├── jobs/
│   │           ├── billing/
│   │           └── auth/
│   └── worker/
├── packages/
│   ├── db/                           # Prisma (updated schema)
│   ├── shared/
│   └── video/                        # Remotion compositions
├── tests/
├── docker/
└── scripts/
```

---

## Implementation Phases (updated)

### Phase 1 — Setup (Day 1-2)
```
- [ ] Turborepo + pnpm + TypeScript strict
- [ ] TasteSkill install: npx taste-skill@latest
- [ ] TasteSkill output-skill install
- [ ] SKILL.md customize cho Vietnamese SaaS brand
- [ ] Docker Compose (PostgreSQL + Redis + MinIO)
- [ ] Prisma schema (ALL models including admin) + migration
- [ ] Seed: test user, admin user, default templates, default providers
- [ ] packages/shared: types, Zod validators
```

### Phase 2 — Core Services (Day 3-7)
```
- [ ] Shopee scraper (Playwright + stealth)
- [ ] TikTok Shop scraper
- [ ] AI provider chain (Gemini FREE → DeepSeek → GPT-4o-mini)
- [ ] FPT.AI TTS + fallback chain
- [ ] R2/MinIO upload service
- [ ] BullMQ pipeline (all queues)
- [ ] FFmpeg service
- [ ] Bank API payment poller
- [ ] Series automation service: cadence, next-video generation, credit guard
```

### Phase 3 — Video Pipeline (Day 8-12)
```
- [ ] Remotion setup
- [ ] 3 templates: clean_minimal, dark_energy, shopee_orange
- [ ] Template/style marketplace foundation: UGC hook, vlog, story, anime, comic, cartoon, cinematic
- [ ] Caption overlay (Whisper word-level sync)
- [ ] Caption Studio: caption presets, emoji/GIF highlights, SRT/VTT export
- [ ] Music ducking + thumbnail generation
- [ ] Voice/music preview before render
- [ ] Pipeline integration test
```

### Phase 4 — Frontend User Side (Day 13-18)
```
- [ ] Design system (TasteSkill enforced)
- [ ] Responsive/adaptive design system: 320, 375, 428, 768, 1024, 1280, 1920, 2560px
- [ ] Auth flow (register → verify → login)
- [ ] Dashboard + create + jobs + videos
- [ ] Video library filters: platform, status, template, source, series, date, language
- [ ] Preview/edit before render: script, title, images, music, voice, CTA
- [ ] Series wizard: topic, niche, cadence, template, voice, platform targets
- [ ] Social scheduler calendar and manual publish checklist
- [ ] Mobile bottom nav, sticky CTA, safe-area support, pull-to-refresh job list
- [ ] Tablet split-view dashboard and side-by-side script/video preview
- [ ] Desktop shortcuts, hover/tooltips, multi-column layouts
- [ ] Billing: bank transfer + QR + auto confirm
- [ ] Settings
- [ ] Landing, pricing, features (SEO)
- [ ] Multi-domain middleware
- [ ] Affiliate referral dashboard for this SaaS
```

### Phase 5 — Admin Panel (Day 19-23) ⭐
```
- [ ] Admin layout: sidebar, breadcrumbs, role guard
- [ ] Responsive admin shell: mobile bottom sheet nav, tablet collapsible sidebar, desktop persistent sidebar
- [ ] Admin tables: card layout mobile, horizontal scroll fallback, table desktop
- [ ] Module 1: User management (full CRUD)
- [ ] Module 2: Job management (full CRUD + queue)
- [ ] Module 3: Video management
- [ ] Module 4: Payment management + reconciliation
- [ ] Module 5: Subscription management
- [ ] Module 6: Template management (CRUD + preview)
- [ ] Module 6B: Series management (CRUD + schedule + pause/resume)
- [ ] Module 7: TTS voice management (CRUD + test)
- [ ] Module 8: AI provider management (CRUD + test)
- [ ] Module 9: System settings (all configurable)
- [ ] Module 10: Audit logs viewer
- [ ] Module 11: Analytics dashboard + charts
```

### Phase 6 — Testing (Day 24-28) 🧪
```
100% coverage — see testing plan below
```

### Phase 7 — Staging + Production (Day 29-32)
```
- [ ] Local Docker production simulation
- [ ] Full regression + security audit
- [ ] VPS provisioning + deploy + SSL
- [ ] Monitoring + backup
- [ ] Go live ✅
```

---

## 🧪 Testing Plan — 100% Coverage (~220 tests)

### New: Admin Tests

#### Unit Tests — Admin (+15)
```
✅ Admin middleware: role check, reject non-admin
✅ User CRUD validators: create, update, credit adjust
✅ Payment code matcher: description matching logic
✅ Template config validator: JSON schema
✅ Settings validator: key-value pairs
✅ Audit log formatter
✅ CSV export formatter: users, payments, logs
✅ Revenue calculator: daily, monthly, by plan
✅ Credit adjustment: add/subtract/refund logic
✅ Ban/unban toggle logic
✅ Template sort order updater
✅ Provider chain builder from DB config
✅ Rate limit config parser
✅ Feature flag evaluator
✅ Encryption/decryption for API keys
```

#### Integration Tests — Admin (+10)
```
✅ Admin create user → user exists in DB + password hashed
✅ Admin adjust credits → user credits updated + audit logged
✅ Admin ban user → user cannot login
✅ Admin manual confirm payment → credits/plan updated
✅ Admin refund payment → credits reversed + audit logged
✅ Admin CRUD template → template available/unavailable for jobs
✅ Admin CRUD TTS provider → provider chain updated
✅ Admin CRUD AI provider → provider chain updated
✅ Admin update settings → settings applied system-wide
✅ Admin toggle maintenance mode → user routes return 503
```

#### E2E Tests — Admin (+12)
```
✅ Admin login → see admin dashboard
✅ Non-admin → redirect from /admin
✅ User list: search, filter, pagination works
✅ Create user → appears in list
✅ Edit user → changes saved
✅ Ban user → status changes, audit logged
✅ Payment list → manual confirm → status updates
✅ Template CRUD → create, edit, disable, delete
✅ TTS provider → add, test voice plays audio, delete
✅ System settings → change site name → reflected on landing
✅ Audit logs → filter by action, see details
✅ Analytics → charts render, date picker works
```

#### Responsive Tests (+15)
```
✅ Viewport 320px: no horizontal overflow, primary CTA reachable
✅ Viewport 375px: dashboard create-job form usable
✅ Viewport 428px: video preview keeps 9:16 ratio
✅ Viewport 768px: tablet dashboard split-view renders
✅ Viewport 1024px: script + video preview side-by-side
✅ Viewport 1280px: desktop sidebar/breadcrumb layout renders
✅ Viewport 1920px: max-width and multi-column layout do not stretch badly
✅ Orientation change portrait ↔ landscape keeps state
✅ Touch simulation: bottom nav and sticky CTA are tappable
✅ iOS Safari viewport height: safe-area spacing works
✅ Reduced motion: animations disabled or shortened
✅ Dark mode: prefers-color-scheme dark passes contrast
✅ Slow connection: media quality fallback path selected
✅ Admin table mobile: card layout visible without hidden actions
✅ Video player: fullscreen mobile and PiP desktop controls available
```

#### Competitive Feature Tests (+25)
```
✅ Series wizard creates topic, cadence, template, voice, and platform targets
✅ Series scheduler creates next queued job only when credits allow
✅ Series pause prevents new jobs
✅ Video library filters by status, template, source, date, and language
✅ Preview edit saves script, title, images, music, voice, and CTA
✅ Scheduler calendar shows drafts, queued posts, published posts, and failed posts
✅ Bulk scheduling respects platform-specific caption limits
✅ Manual publish checklist appears for platforms without API approval
✅ Caption Studio changes font, color, animation, emoji highlights
✅ Caption Studio exports SRT and VTT
✅ Transcript import accepts uploaded video
✅ Transcript import accepts TikTok/YouTube URL when supported
✅ Long-video clipper creates multiple clip candidates
✅ Keyword-guided clipping includes requested moments
✅ Auto-reframe keeps 9:16 output
✅ Template gallery preview renders sample output
✅ Template A/B assignment persists per series
✅ Voice preview plays before render
✅ Music ducking preset changes mix plan
✅ TikTok calculator stores estimated account metrics
✅ Trend board saves competitor examples without copying assets
✅ Affiliate referral link tracks clicks
✅ Referral conversion creates pending commission
✅ Affiliate disclosure can be inserted into script/caption
✅ Platform policy check blocks banned content before render/post
```

#### API Tests — Admin (+12)
```
✅ All admin endpoints return 403 for non-admin
✅ GET /api/admin/users — paginated list
✅ POST /api/admin/users — create with validation
✅ PATCH /api/admin/users/[id] — update fields
✅ DELETE /api/admin/users/[id] — soft delete
✅ PATCH /api/admin/users/[id]/credits — adjust
✅ POST /api/admin/users/[id]/ban — toggle
✅ POST /api/admin/payments/[id]/confirm — manual confirm
✅ POST /api/admin/payments/[id]/refund — refund
✅ CRUD /api/admin/templates — all operations
✅ CRUD /api/admin/tts — all operations
✅ GET /api/admin/stats — dashboard data
```

### Full Test Summary

| Category | Count | Tool |
|----------|-------|------|
| Unit (shared + worker + admin) | ~65 | Vitest |
| Integration (pipeline + auth + billing + admin) | ~30 | Vitest + DB |
| API (user + admin) | ~37 | Vitest + fetch |
| E2E (user flows + admin flows) | ~42 | Playwright |
| Responsive | ~15 | Playwright + device presets |
| Competitive feature coverage | ~25 | Playwright + API |
| Security | ~18 | Custom |
| Performance | ~8 | k6 |
| Cross-browser | 5 | Playwright |
| Accessibility | scan | axe-core |
| **Total** | **~245 tests** | **100% pass** |

---

## VPS Recommendation

| Tier | vCPU | RAM | Disk | Giá ~ | Khi nào |
|------|------|-----|------|-------|---------|
| Starter | 4 | 8 GB | 100 GB | ~$30/tháng | MVP |
| **Growth ⭐** | **8** | **16 GB** | **200 GB** | **~$60/tháng** | **100-1000 user** |
| Scale | 16 | 32 GB | 400 GB | ~$120/tháng | 1000+ user |

---

## Security — 5 Layers

```
Layer 1 — Network: Nginx + SSL + rate limit + CORS + Helmet + Fail2ban
Layer 2 — Auth: bcrypt(12) + JWT(15min/7d) + CSRF + lockout + admin role guard
Layer 3 — Input: Zod all inputs + URL allowlist + CSP + file validation
Layer 4 — Infra: encrypted API keys in DB + R2 signed URLs + Redis AUTH
Layer 5 — Business: credits + ownership + audit log + payment code verify + feature flags
```

---

## Cost Summary

| Component | Free Tier | Paid (per video) |
|-----------|-----------|-------------------|
| AI Script | 0đ (Gemini free) | ~23 VND (DeepSeek) |
| TTS | 0đ (FPT trial) | ~200-500 VND |
| Render | 0đ (self-host) | 0đ |
| Storage | 0đ (R2 free 10GB) | ~5 VND |
| **Total** | **~0đ** | **~230-530 VND** |
| VPS | — | ~$60/tháng |
| Bank API | — | phí thuê API (tùy gói) |
