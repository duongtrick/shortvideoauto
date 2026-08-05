import type { z } from "zod";
import type { captionSegment } from "@/lib/caption-validation";

type CaptionSegment = z.infer<typeof captionSegment>;

export function exportSrt(segments: CaptionSegment[]) {
  return segments
    .map((segment, index) => {
      return [
        String(index + 1),
        `${formatSrtTime(segment.startMs)} --> ${formatSrtTime(segment.endMs)}`,
        segment.text
      ].join("\n");
    })
    .join("\n\n");
}

export function exportVtt(segments: CaptionSegment[]) {
  return `WEBVTT\n\n${segments
    .map((segment) => `${formatVttTime(segment.startMs)} --> ${formatVttTime(segment.endMs)}\n${segment.text}`)
    .join("\n\n")}`;
}

function formatSrtTime(ms: number) {
  return formatTime(ms, ",");
}

function formatVttTime(ms: number) {
  return formatTime(ms, ".");
}

function formatTime(ms: number, decimal: "," | ".") {
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  const millis = ms % 1000;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}${decimal}${String(millis).padStart(3, "0")}`;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}
