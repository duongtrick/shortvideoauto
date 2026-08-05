import { Worker } from "bullmq";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { renderQueueName, type RenderJobPayload } from "@/lib/queue";
import { parseProductUrl } from "@/lib/product-url";

async function runRenderPipeline(payload: RenderJobPayload) {
  const { normalizedUrl, host } = parseProductUrl(payload.sourceUrl);

  await prisma.renderJob.update({
    where: { id: payload.jobId },
    data: { status: "scraping", attempts: { increment: 1 } }
  });

  const product = await prisma.productSource.create({
    data: {
      url: normalizedUrl,
      host,
      title: "Sản phẩm demo",
      price: "199.000đ",
      imageUrls: [],
      description: "Dữ liệu demo cho MVP trước khi bật scraper thật.",
      rating: "4.8"
    }
  });

  await prisma.renderJob.update({
    where: { id: payload.jobId },
    data: { status: "scripting", productSourceId: product.id }
  });

  await prisma.scriptVariant.createMany({
    data: [
      {
        jobId: payload.jobId,
        angle: "review nhanh",
        content: "Món này hợp nếu bạn cần giải pháp gọn, giá tốt, dễ dùng mỗi ngày.",
        score: 85
      },
      {
        jobId: payload.jobId,
        angle: "deal sốc",
        content: "Deal hôm nay đáng chú ý: giá đang mềm, chốt sớm kẻo hết mã.",
        score: 80
      },
      {
        jobId: payload.jobId,
        angle: "vấn đề - giải pháp",
        content: "Bạn đang mất thời gian chọn đồ? Sản phẩm này giải quyết nhanh với chi phí thấp.",
        score: 78
      }
    ]
  });

  await prisma.renderJob.update({ where: { id: payload.jobId }, data: { status: "tts" } });
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
