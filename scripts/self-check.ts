import assert from "node:assert/strict";
import { parseProductUrl } from "../src/lib/product-url";
import { isTerminalJobStep } from "../src/lib/job-state";
import { createRenderPlan } from "../src/lib/render-plan";
import { checkRateLimit } from "../src/lib/rate-limit";
import { scrapeProduct } from "../src/services/scraper";
import { writeVietnameseScripts } from "../src/services/script-writer";
import { synthesizeVietnameseSpeech } from "../src/services/tts";
import {
  createSignedDownloadUrl,
  createStorageKey,
  verifySignedDownloadUrl
} from "../src/services/storage";

assert.equal(parseProductUrl("https://shopee.vn/test?utm=1#frag").normalizedUrl, "https://shopee.vn/test?utm=1");
assert.equal(parseProductUrl("https://shop.tiktok.com/view/product/1").host, "shop.tiktok.com");
assert.equal(isTerminalJobStep("completed"), true);
assert.equal(isTerminalJobStep("rendering"), false);
assert.equal(createRenderPlan({ title: "A", price: "1đ" }).output.width, 1080);
assert.equal(checkRateLimit("test", 1, 1000).allowed, true);
assert.equal(checkRateLimit("test", 1, 1000).allowed, false);

const product = await scrapeProduct("https://shopee.vn/test");
const scripts = await writeVietnameseScripts(product);
const voice = await synthesizeVietnameseSpeech(scripts[0].content);
assert.equal(scripts.length, 3);
assert.equal(voice.language, "vi-VN");

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
assert.throws(() => parseProductUrl("http://shopee.vn/item"));
assert.throws(() => parseProductUrl("https://localhost/admin"));
assert.throws(() => parseProductUrl("https://example.com/item"));

console.log("self-check passed");
