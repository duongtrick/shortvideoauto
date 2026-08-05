import { exportSrt, exportVtt } from "./captions";
import { createSignedDownloadUrl } from "./storage";

type ExportVideo = {
  id: string;
  storageKey: string;
  publicSlug: string;
  width: number;
  height: number;
  durationMs: number | null;
  job: {
    sourceUrl: string;
    productSource: {
      title: string | null;
      price: string | null;
      description: string | null;
      rating: string | null;
      imageUrls: string[];
    } | null;
    scriptVariants: Array<{
      angle: string;
      content: string;
      score: number;
    }>;
    series: {
      name: string;
      niche: string;
      cadence: string;
      language: string;
      platformTargets: string[];
      templateKey: string | null;
      voice: string | null;
      defaultCta: string | null;
    } | null;
  } | null;
};

export function createVideoExportBundle(video: ExportVideo) {
  const bestScript = [...(video.job?.scriptVariants ?? [])].sort((a, b) => b.score - a.score)[0];
  const captions = bestScript
    ? [{ startMs: 0, endMs: Math.max(video.durationMs ?? 30_000, 1500), text: bestScript.content }]
    : [];

  return {
    video: {
      id: video.id,
      publicSlug: video.publicSlug,
      width: video.width,
      height: video.height,
      durationMs: video.durationMs,
      downloadUrl: createSignedDownloadUrl(video.storageKey)
    },
    product: video.job?.productSource ?? null,
    sourceUrl: video.job?.sourceUrl ?? null,
    series: video.job?.series ?? null,
    scripts: video.job?.scriptVariants ?? [],
    captions: {
      segments: captions,
      srt: captions.length ? exportSrt(captions) : "",
      vtt: captions.length ? exportVtt(captions) : ""
    }
  };
}
