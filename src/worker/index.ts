import { Worker } from "bullmq";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { renderQueueName, type RenderJobPayload } from "@/lib/queue";
import { parseProductUrl } from "@/lib/product-url";
import { scrapeProduct } from "@/services/scraper";
import { writeVietnameseScripts } from "@/services/script-writer";
import { synthesizeVietnameseSpeech } from "@/services/tts";

async function runRenderPipeline(payload: RenderJobPayload) {
  const { normalizedUrl, host } = parseProductUrl(payload.sourceUrl);

  await prisma.renderJob.update({
    where: { id: payload.jobId },
    data: { status: "scraping", attempts: { increment: 1 } }
  });

  const scraped = await scrapeProduct(normalizedUrl);
  const product = await prisma.productSource.create({
    data: {
      url: scraped.url,
      host: scraped.host || host,
      title: scraped.title,
      price: scraped.price,
      imageUrls: scraped.imageUrls,
      description: scraped.description,
      rating: scraped.rating
    }
  });

  await prisma.renderJob.update({
    where: { id: payload.jobId },
    data: { status: "scripting", productSourceId: product.id }
  });

  const scripts = await writeVietnameseScripts(scraped);
  await prisma.scriptVariant.createMany({
    data: scripts.map((script) => ({ jobId: payload.jobId, ...script }))
  });

  await prisma.renderJob.update({ where: { id: payload.jobId }, data: { status: "tts" } });
  const voice = await synthesizeVietnameseSpeech(scripts[0].content);
  await prisma.voiceAsset.create({ data: voice });
  await prisma.renderJob.update({ where: { id: payload.jobId }, data: { status: "rendering" } });
  await prisma.renderJob.update({ where: { id: payload.jobId }, data: { status: "uploading" } });

  const video = await prisma.video.create({
    data: {
      userId: payload.userId,
      storageKey: `videos/${payload.userId}/${payload.jobId}.mp4`,
      publicSlug: payload.jobId
    }
  });

  await prisma.renderJob.update({
    where: { id: payload.jobId },
    data: { status: "completed", outputVideoId: video.id }
  });
}

const worker = new Worker<RenderJobPayload>(
  renderQueueName,
  async (job) => {
    try {
      await runRenderPipeline(job.data);
    } catch (error) {
      await prisma.renderJob.update({
        where: { id: job.data.jobId },
        data: {
          status: "failed",
          errorCode: "WORKER_PIPELINE_FAILED",
          errorMessage: error instanceof Error ? error.message : "Unknown worker error"
        }
      });
      throw error;
    }
  },
  { connection: { url: env.REDIS_URL }, concurrency: 2 }
);

worker.on("failed", (job, error) => {
  console.error("render job failed", { jobId: job?.data.jobId, error: error.message });
});

console.log(`worker listening on ${renderQueueName}`);
