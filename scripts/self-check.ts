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
assert.throws(() => parseProductUrl("http://shopee.vn/item"));
assert.throws(() => parseProductUrl("https://localhost/admin"));
assert.throws(() => parseProductUrl("https://example.com/item"));
assert.equal(isPrivateIp("127.0.0.1"), true);
assert.equal(isPrivateIp("8.8.8.8"), false);

console.log("self-check passed");
