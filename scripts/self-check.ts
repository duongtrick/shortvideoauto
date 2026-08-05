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
import { createHmac } from "node:crypto";
import { createFfmpegNormalizeArgs, createRenderArtifact } from "../src/services/renderer";
import { logger } from "../src/lib/logger";
import { buildAffiliateScriptPrompt, getAiProviderChain } from "../src/services/ai-providers";
import { createPlaceholderVoice, getTtsProviderChain } from "../src/services/tts-providers";
import { createPaymentCode, findPaymentCode, matchBankTransaction } from "../src/services/bank-payments";
import { getAdminStats } from "../src/services/admin-stats";
import { writeAuditLog } from "../src/services/audit";
import { getConfiguredDomains, resolveTenantDomain } from "../src/lib/domains";
import { getSystemSetting, setSystemSetting } from "../src/services/system-settings";
import { createResetToken, hashPassword, verifyPassword } from "../src/services/passwords";
import { seriesInput } from "../src/lib/series-validation";
import { videoLibraryQuery } from "../src/lib/video-library-validation";
import { scheduledPostInput } from "../src/lib/scheduler-validation";
import { createManualPublishChecklist } from "../src/services/scheduler";
import { appendAffiliateDisclosure, checkAffiliateContentPolicy } from "../src/services/content-policy";
import { tiktokCalculatorInput } from "../src/lib/tiktok-calculator-validation";
import { estimateTikTokAccount } from "../src/services/tiktok-calculator";
import { calculateCommission, createReferralCode } from "../src/services/referrals";
import { captionExportInput } from "../src/lib/caption-validation";
import { exportSrt, exportVtt } from "../src/services/captions";
import { createVideoExportBundle } from "../src/services/video-export";
import { templateMarketplaceQuery } from "../src/lib/template-marketplace-validation";
import { createTemplatePreview, filterTemplatePreviews } from "../src/services/template-marketplace";
import { inspirationInput } from "../src/lib/inspiration-validation";
import { normalizeInspirationUrl, summarizeInspiration } from "../src/services/inspiration";
import { clipCandidatesInput } from "../src/lib/clip-candidates-validation";
import { createClipCandidates } from "../src/services/clip-candidates";
import { notificationPreferenceInput } from "../src/lib/notification-validation";
import { renderJobCompletedEmail, renderJobFailedEmail, renderPaymentConfirmedEmail } from "../src/services/notifications";

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
assert.equal(videoLibraryQuery.safeParse({ take: "20", status: "completed" }).success, true);
assert.equal(videoLibraryQuery.safeParse({ take: "999" }).success, false);
assert.equal(
  scheduledPostInput.safeParse({
    videoId: "video_1",
    platform: "tiktok",
    scheduledAt: new Date().toISOString()
  }).success,
  true
);
assert.equal(createManualPublishChecklist("tiktok").steps.length > 3, true);
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
assert.throws(() => parseProductUrl("http://shopee.vn/item"));
assert.throws(() => parseProductUrl("https://localhost/admin"));
assert.throws(() => parseProductUrl("https://example.com/item"));
assert.equal(isPrivateIp("127.0.0.1"), true);
assert.equal(isPrivateIp("8.8.8.8"), false);

console.log("self-check passed");
