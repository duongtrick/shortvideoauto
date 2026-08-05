import { createRenderPlan, type RenderPlan } from "@/lib/render-plan";
import type { ScrapedProduct } from "./scraper";

export type RenderArtifact = {
  plan: RenderPlan;
  tempVideoPath: string;
  normalizedVideoPath: string;
};

export function createRenderArtifact(input: { jobId: string; product: ScrapedProduct }): RenderArtifact {
  const plan = createRenderPlan({ title: input.product.title, price: input.product.price });

  return {
    plan,
    tempVideoPath: `tmp/${input.jobId}/raw.mp4`,
    normalizedVideoPath: `tmp/${input.jobId}/normalized.mp4`
  };
}

export function createFfmpegNormalizeArgs(input: { sourcePath: string; outputPath: string }) {
  return [
    "-y",
    "-i",
    input.sourcePath,
    "-vf",
    "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "160k",
    input.outputPath
  ];
}
