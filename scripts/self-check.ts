import assert from "node:assert/strict";
import { isPrivateIp, parseProductUrl } from "../src/lib/product-url";
import { isTerminalJobStep } from "../src/lib/job-state";
import { createRenderPlan } from "../src/lib/render-plan";
import { checkRateLimit } from "../src/lib/rate-limit";
import { sanitizeScrapedText, scrapeProduct } from "../src/services/scraper";
import { writeVietnameseScripts } from "../src/services/script-writer";
import { synthesizeVietnameseSpeech } from "../src/services/tts";
import {
  createSignedDownloadUrl,
  createStorageKey,
  verifySignedDownloadUrl
} from "../src/services/storage";
import { verifyWebhookSignature } from "../src/services/billing";
import { createBankPaymentInput } from "../src/lib/billing-validation";
import { createHmac } from "node:crypto";
import { createFfmpegNormalizeArgs, createRenderArtifact } from "../src/services/renderer";
import { logger } from "../src/lib/logger";
import { buildAffiliateScriptPrompt, getAiProviderChain } from "../src/services/ai-providers";
import { createPlaceholderVoice, getTtsProviderChain } from "../src/services/tts-providers";
import { createBankTransferInstruction, createPaymentCode, findPaymentCode, matchBankTransaction } from "../src/services/bank-payments";
import { getAdminStats } from "../src/services/admin-stats";
import { writeAuditLog } from "../src/services/audit";
import { getConfiguredDomains, resolveTenantDomain } from "../src/lib/domains";
import { getSystemSetting, setSystemSetting } from "../src/services/system-settings";
import { createResetToken, hashPassword, verifyPassword } from "../src/services/passwords";
import { adminSeriesInput, adminSeriesPatch, seriesInput } from "../src/lib/series-validation";
import { videoLibraryQuery } from "../src/lib/video-library-validation";
import { jobPreviewPatch } from "../src/lib/job-preview-validation";
import { bestTimeInput, scheduledPostInput, scheduleSuggestionInput } from "../src/lib/scheduler-validation";
import { createManualPublishChecklist, recommendBestScheduleTimes, suggestScheduleCopy } from "../src/services/scheduler";
import { appendAffiliateDisclosure, checkAffiliateContentPolicy } from "../src/services/content-policy";
import { tiktokCalculatorInput } from "../src/lib/tiktok-calculator-validation";
import { estimateTikTokAccount } from "../src/services/tiktok-calculator";
import { calculateCommission, createReferralCode } from "../src/services/referrals";
import { captionExportInput, captionPreviewInput } from "../src/lib/caption-validation";
import { createCaptionPreview, createCaptionStyle, exportSrt, exportVtt } from "../src/services/captions";
import { createVideoExportBundle } from "../src/services/video-export";
import { createThumbnailPlan } from "../src/services/thumbnails";
import { audioMixInput } from "../src/lib/audio-mix-validation";
import { createMusicDuckingPlan } from "../src/services/audio-mix";
import { mediaPreviewQuery } from "../src/lib/media-preview-validation";
import { listMediaPreviews } from "../src/services/media-preview";
import { createPipelineReadinessReport } from "../src/services/pipeline-check";
import { createNextSeriesRun, getSeriesCadenceIntervalHours } from "../src/services/series-automation";
import { templateMarketplaceQuery } from "../src/lib/template-marketplace-validation";
import { createTemplatePreview, filterTemplatePreviews } from "../src/services/template-marketplace";
import { inspirationInput } from "../src/lib/inspiration-validation";
import { normalizeInspirationUrl, summarizeInspiration } from "../src/services/inspiration";
import { clipCandidatesInput } from "../src/lib/clip-candidates-validation";
import { createClipCandidates } from "../src/services/clip-candidates";
import { notificationPreferenceInput } from "../src/lib/notification-validation";
import { emailDeliveryQuery, emailDigestInput } from "../src/lib/email-delivery-validation";
import { emailWebhookInput } from "../src/lib/email-webhook-validation";
import { emailTemplatePatch, emailTemplateTestInput } from "../src/lib/email-template-validation";
import { defaultEmailTemplate, emailTemplateKeys } from "../src/services/email-templates";
import { queuedJobAlertInput } from "../src/lib/job-alert-validation";
import {
  adminBanUserInput,
  adminCreateUserInput,
  adminCreditAdjustmentInput,
  adminUpdateUserInput,
  adminUsersQuery
} from "../src/lib/admin-user-validation";
import { adminProviderInput, adminProviderPatch, adminProviderTestInput } from "../src/lib/admin-provider-validation";
import { adminSubscriptionInput, adminSubscriptionPatch } from "../src/lib/admin-subscription-validation";
import {
  renderJobCompletedEmail,
  renderJobFailedEmail,
  renderPaymentConfirmedEmail,
  renderPasswordResetEmail,
  renderQueuedTooLongEmail,
  renderNotificationDigestEmail,
  renderWelcomeEmail,
  isSecurityEmailEvent,
  isWithinQuietHours,
  retryEmailDelivery,
  sendNotificationDigest
} from "../src/services/notifications";

assert.equal(parseProductUrl("https://shopee.vn/test?utm=1#frag").normalizedUrl, "https://shopee.vn/test?utm=1");
assert.equal(parseProductUrl("https://shop.tiktok.com/view/product/1").host, "shop.tiktok.com");
assert.equal(isTerminalJobStep("completed"), true);
assert.equal(isTerminalJobStep("rendering"), false);
assert.equal(createRenderPlan({ title: "A", price: "1đ" }).output.width, 1080);
assert.equal(checkRateLimit("test", 1, 1000).allowed, true);
assert.equal(checkRateLimit("test", 1, 1000).allowed, false);

const product = await scrapeProduct("https://shopee.vn/test");
assert.equal(product.platform, "shopee");
assert.equal(sanitizeScrapedText("<b>A</b>   B"), "A B");
const scripts = await writeVietnameseScripts(product);
const voice = await synthesizeVietnameseSpeech(scripts[0].content);
assert.equal(scripts.length, 3);
assert.equal(voice.language, "vi-VN");
assert.equal(getAiProviderChain().length, 0);
assert.equal(getTtsProviderChain().length, 0);
assert.equal(createPlaceholderVoice("hello").provider, "placeholder");
assert.match(buildAffiliateScriptPrompt(product), /JSON array/);
const artifact = createRenderArtifact({ jobId: "job_1", product });
assert.equal(artifact.plan.compositionId, "ProductShort");
assert.deepEqual(createFfmpegNormalizeArgs({ sourcePath: "a.mp4", outputPath: "b.mp4" }).slice(-1), [
  "b.mp4"
]);

const refundMeta = { jobId: "job_1" };
assert.equal(refundMeta.jobId, "job_1");
const key = createStorageKey({ userId: "user_1", jobId: "job_1", ext: "mp4" });
const signedUrl = new URL(createSignedDownloadUrl(key));
assert.equal(key, "videos/user_1/job_1.mp4");
assert.equal(
  verifySignedDownloadUrl({
    key,
    expires: signedUrl.searchParams.get("expires") ?? "",
    signature: signedUrl.searchParams.get("signature") ?? ""
  }),
  true
);
const payload = "{\"id\":\"evt_1\",\"type\":\"checkout.session.completed\"}";
const secret = "webhook-secret";
const signature = createHmac("sha256", secret).update(payload).digest("hex");
assert.equal(verifyWebhookSignature({ payload, secret, signature }), true);
assert.equal(verifyWebhookSignature({ payload, secret, signature: "bad" }), false);
assert.equal(typeof logger.info, "function");
assert.match(createPaymentCode(), /^CTF5\d{6}$/);
assert.equal(createBankPaymentInput.safeParse({ amount: 100000, credits: 100 }).success, true);
assert.match(createBankTransferInstruction({ code: "CTF5123456", amount: 100000, credits: 100 }).content, /CTF5123456/);
assert.equal(findPaymentCode("Nap tien CTF5123456 cam on"), "CTF5123456");
assert.equal(
  matchBankTransaction(
    { id: "txn_1", amount: 100000, description: "CTF5123456" },
    { code: "CTF5123456", amount: 99000, status: "pending" }
  ),
  true
);
assert.equal(typeof getAdminStats, "function");
assert.equal(typeof writeAuditLog, "function");
assert.deepEqual(getConfiguredDomains("a.test:Brand A")[0], { host: "a.test", brand: "Brand A" });
assert.equal(resolveTenantDomain("a.test:3000", [{ host: "a.test", brand: "A" }]).brand, "A");
assert.equal(typeof getSystemSetting, "function");
assert.equal(typeof setSystemSetting, "function");
const passwordHash = hashPassword("password123");
assert.equal(verifyPassword("password123", passwordHash), true);
assert.equal(verifyPassword("wrongpass", passwordHash), false);
assert.equal(createResetToken().token.length > 40, true);
assert.equal(
  seriesInput.safeParse({
    name: "Shopee deals",
    niche: "Gia dung",
    cadence: "daily",
    platformTargets: ["tiktok"]
  }).success,
  true
);
assert.equal(
  adminSeriesInput.safeParse({
    userEmail: "admin@example.com",
    name: "Shopee deals",
    niche: "Gia dung",
    cadence: "daily",
    platformTargets: ["tiktok"]
  }).success,
  true
);
assert.equal(adminSeriesPatch.safeParse({ isActive: false }).success, true);
assert.equal(videoLibraryQuery.safeParse({ take: "20", status: "completed" }).success, true);
assert.equal(videoLibraryQuery.safeParse({ take: "999" }).success, false);
assert.equal(
  jobPreviewPatch.safeParse({
    productTitle: "Noi com mini",
    selectedScriptId: "script_1",
    scriptContent: "Review nhanh san pham dang hot hom nay",
    cta: "Bam xem deal",
    voice: "banmai",
    musicTrack: "summer_deal",
    musicVolume: 0.4,
    captionPreset: "deal_pop"
  }).success,
  true
);
assert.equal(
  scheduledPostInput.safeParse({
    videoId: "video_1",
    platform: "tiktok",
    scheduledAt: new Date().toISOString()
  }).success,
  true
);
assert.equal(createManualPublishChecklist("tiktok").steps.length > 3, true);
assert.equal(scheduleSuggestionInput.safeParse({ videoId: "video_1", platform: "tiktok", tone: "deal" }).success, true);
assert.equal(bestTimeInput.safeParse({ platform: "tiktok", daysAhead: 3 }).success, true);
assert.equal(
  recommendBestScheduleTimes({
    platform: "tiktok",
    timezoneOffsetMinutes: 420,
    daysAhead: 2,
    now: new Date("2026-01-01T00:00:00.000Z")
  }).length > 0,
  true
);
assert.match(
  suggestScheduleCopy({
    platform: "tiktok",
    tone: "deal",
    productTitle: "Noi com mini",
    price: "199k",
    script: "Review nhanh"
  }).caption,
  /lien ket tiep thi/
);
assert.equal(checkAffiliateContentPolicy("bao hanh loi nhuan moi ngay").allowed, false);
assert.match(appendAffiliateDisclosure("Review san pham"), /lien ket tiep thi/);
assert.equal(tiktokCalculatorInput.safeParse({ username: "@shop", followers: 1000, likes: 5000 }).success, true);
assert.equal(estimateTikTokAccount({ followers: 1000, likes: 5000, avgViews: 10000 }).affiliatePotentialScore > 0, true);
assert.equal(createReferralCode("user_1").length, 10);
assert.equal(calculateCommission(100000), 30000);
const captionSegments = [{ startMs: 0, endMs: 1500, text: "Deal hom nay" }];
assert.equal(captionExportInput.safeParse({ format: "srt", segments: captionSegments }).success, true);
assert.match(exportSrt(captionSegments), /00:00:00,000/);
assert.match(exportVtt(captionSegments), /^WEBVTT/);
assert.equal(captionPreviewInput.safeParse({ segments: captionSegments, preset: "deal_pop" }).success, true);
assert.equal(createCaptionStyle({ preset: "deal_pop", brandColor: "#ff6b35", fontFamily: "Inter" }).backgroundColor, "#ff6b35");
assert.equal(
  createCaptionPreview({
    preset: "clean_bold",
    brandColor: "#ff6b35",
    fontFamily: "Inter",
    segments: captionSegments,
    emphasizeWords: ["deal"]
  }).segments[0].words[0].emphasized,
  true
);
assert.equal(templateMarketplaceQuery.safeParse({ platform: "tiktok", take: "12" }).success, true);
const templatePreview = createTemplatePreview({
  key: "ugc_hook",
  name: "UGC Hook",
  config: { category: "ugc", platforms: ["tiktok"], tags: ["deal"], accent: "#f97316" }
});
assert.equal(filterTemplatePreviews([templatePreview], { platform: "tiktok", search: "deal", take: 10 }).length, 1);
assert.equal(
  inspirationInput.safeParse({ sourceUrl: "https://www.tiktok.com/@shop/video/1", platform: "tiktok" }).success,
  true
);
assert.equal(normalizeInspirationUrl("https://www.tiktok.com/@shop/video/1#comments"), "https://www.tiktok.com/@shop/video/1");
assert.equal(summarizeInspiration({ hook: "Dung mua neu chua xem", cta: null, tags: [] }).hasActionablePattern, true);
assert.equal(
  clipCandidatesInput.safeParse({ transcript: "Dung mua san pham nay neu chua xem deal. Bi quyet la xem gia va rating truoc.", maxClips: 2 }).success,
  true
);
assert.equal(
  createClipCandidates({
    transcript: "Dung mua san pham nay neu chua xem deal hot hom nay. Bi quyet la xem gia va rating truoc khi bam mua.",
    targetSeconds: 30,
    maxClips: 1
  }).candidates.length,
  1
);
assert.equal(notificationPreferenceInput.safeParse({ emailRenderDone: true, quietHoursStart: 22 }).success, true);
assert.equal(emailDeliveryQuery.safeParse({ status: "digest_pending", take: "20" }).success, true);
assert.equal(emailDigestInput.safeParse({ take: "100" }).success, true);
assert.equal(emailWebhookInput.safeParse({ providerId: "msg_1", status: "delivered" }).success, true);
assert.equal(emailWebhookInput.safeParse({ status: "opened" }).success, false);
assert.equal(emailTemplatePatch.safeParse({ key: "auth.welcome", subject: "Hello", bodyText: "Welcome body text" }).success, true);
assert.equal(emailTemplateTestInput.safeParse({ key: "render.completed", toEmail: "admin@example.com" }).success, true);
assert.equal(emailTemplateKeys.includes("auth.password_reset"), true);
assert.match(defaultEmailTemplate("billing.payment_confirmed").bodyText, /Credit da cong/);
assert.equal(queuedJobAlertInput.safeParse({ olderThanMinutes: 30, take: 10 }).success, true);
assert.equal(adminUsersQuery.safeParse({ q: "demo", role: "user", take: "20", skip: "0" }).success, true);
assert.equal(adminCreateUserInput.safeParse({ email: "ADMIN@EXAMPLE.COM", password: "password123", role: "admin" }).success, true);
assert.equal(adminUpdateUserInput.safeParse({ name: null, role: "banned" }).success, true);
assert.equal(adminCreditAdjustmentInput.safeParse({ delta: 50, note: "bonus" }).success, true);
assert.equal(adminCreditAdjustmentInput.safeParse({ delta: 0 }).success, false);
assert.equal(adminBanUserInput.safeParse({ banned: true }).success, true);
assert.equal(adminProviderInput.safeParse({ key: "fpt", name: "FPT.AI", config: { voice: "banmai" } }).success, true);
assert.equal(adminProviderPatch.safeParse({ isActive: false }).success, true);
assert.equal(adminProviderTestInput.safeParse({ text: "Xin chao" }).success, true);
assert.equal(
  adminSubscriptionInput.safeParse({
    userEmail: "admin@example.com",
    provider: "manual",
    providerId: "sub_1",
    status: "active",
    currentPeriodEnd: new Date("2026-12-31T00:00:00.000Z").toISOString()
  }).success,
  true
);
assert.equal(adminSubscriptionPatch.safeParse({ status: "canceled", currentPeriodEnd: null }).success, true);
assert.equal(isWithinQuietHours(23, 22, 7), true);
assert.equal(isWithinQuietHours(12, 22, 7), false);
assert.equal(isSecurityEmailEvent("auth.password_reset"), true);
assert.match(
  renderNotificationDigestEmail({
    appUrl: "https://shortvideoauto.local",
    count: 2,
    items: [{ event: "render.completed", subject: "Video done" }]
  }).bodyText,
  /thong bao moi/
);
assert.match(
  renderQueuedTooLongEmail({
    appUrl: "https://shortvideoauto.local",
    jobId: "job_1",
    queuedMinutes: 45
  }).bodyText,
  /queued/
);
assert.equal(typeof retryEmailDelivery, "function");
assert.equal(typeof sendNotificationDigest, "function");
assert.match(
  renderJobCompletedEmail({
    appUrl: "https://shortvideoauto.local",
    videoTitle: "Deal hot",
    downloadUrl: "https://shortvideoauto.local/d.mp4",
    exportUrl: "https://shortvideoauto.local/export",
    scheduleUrl: "https://shortvideoauto.local/schedule",
    durationMs: 30000
  }).bodyText,
  /Tai MP4/
);
assert.match(
  renderJobFailedEmail({
    appUrl: "https://shortvideoauto.local",
    jobId: "job_1",
    errorCode: "WORKER_PIPELINE_FAILED",
    refundStatus: "refunded"
  }).bodyText,
  /Trang thai hoan credit/
);
assert.match(
  renderPaymentConfirmedEmail({
    appUrl: "https://shortvideoauto.local",
    code: "CTF5123456",
    amount: 100000,
    credits: 100
  }).bodyText,
  /Credit da cong/
);
assert.match(
  renderWelcomeEmail({
    appUrl: "https://shortvideoauto.local",
    name: "Demo",
    email: "demo@example.com"
  }).bodyText,
  /Tao video dau tien/
);
assert.match(
  renderPasswordResetEmail({
    appUrl: "https://shortvideoauto.local",
    resetUrl: "https://shortvideoauto.local/reset-password?token=secret",
    expiresMinutes: 30
  }).bodyText,
  /Link het han/
);
assert.equal(
  createVideoExportBundle({
    id: "video_1",
    storageKey: "videos/user_1/job_1.mp4",
    publicSlug: "video_1",
    width: 1080,
    height: 1920,
    durationMs: 30000,
    job: {
      sourceUrl: "https://shopee.vn/item",
      productSource: null,
      series: null,
      scriptVariants: [{ angle: "review", content: "Review san pham tot", score: 80 }]
    }
  }).captions.srt.length > 0,
  true
);
assert.equal(createThumbnailPlan({ title: "Noi com mini", price: "199k", imageUrl: "https://example.com/a.jpg" }).width, 1080);
assert.equal(
  audioMixInput.safeParse({ voicePath: "voice.mp3", musicPath: "music.mp3", outputPath: "mix.m4a", preset: "normal" }).success,
  true
);
assert.match(
  createMusicDuckingPlan({
    voicePath: "voice.mp3",
    musicPath: "music.mp3",
    outputPath: "mix.m4a",
    preset: "aggressive",
    musicVolume: 0.4
  }).filter,
  /sidechaincompress/
);
assert.equal(mediaPreviewQuery.safeParse({ type: "voice", language: "vi-VN" }).success, true);
assert.equal(listMediaPreviews({ type: "voice", language: "vi-VN" }).voices.length > 0, true);
assert.equal(
  createPipelineReadinessReport({
    hasScraper: true,
    scriptVariants: 3,
    hasVoice: true,
    hasRenderPlan: true,
    hasStorageKey: true
  }).ready,
  true
);
assert.equal(getSeriesCadenceIntervalHours("daily"), 24);
assert.equal(
  createNextSeriesRun({
    seriesId: "series_1",
    cadence: "daily",
    lastJobCreatedAt: new Date("2026-01-01T00:00:00.000Z"),
    now: new Date("2026-01-02T01:00:00.000Z"),
    hasCredits: true
  }).canQueueNow,
  true
);
assert.throws(() => parseProductUrl("http://shopee.vn/item"));
assert.throws(() => parseProductUrl("https://localhost/admin"));
assert.throws(() => parseProductUrl("https://example.com/item"));
assert.equal(isPrivateIp("127.0.0.1"), true);
assert.equal(isPrivateIp("8.8.8.8"), false);

console.log("self-check passed");
