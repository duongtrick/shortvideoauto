import type { z } from "zod";
import type { captionPresetKey, captionSegment } from "@/lib/caption-validation";

type CaptionSegment = z.infer<typeof captionSegment>;
type CaptionPresetKey = z.infer<typeof captionPresetKey>;

type CaptionStyle = {
  preset: CaptionPresetKey;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  textColor: string;
  strokeColor: string;
  backgroundColor: string;
  animation: "pop" | "slide_up" | "karaoke" | "fade";
  emojiHighlights: boolean;
};

const presetBase: Record<CaptionPresetKey, Omit<CaptionStyle, "preset" | "fontFamily">> = {
  clean_bold: {
    fontSize: 72,
    lineHeight: 1.12,
    textColor: "#ffffff",
    strokeColor: "#111827",
    backgroundColor: "transparent",
    animation: "slide_up",
    emojiHighlights: false
  },
  deal_pop: {
    fontSize: 78,
    lineHeight: 1.08,
    textColor: "#ffffff",
    strokeColor: "#7c2d12",
    backgroundColor: "#ff6b35",
    animation: "pop",
    emojiHighlights: true
  },
  story_subtle: {
    fontSize: 58,
    lineHeight: 1.2,
    textColor: "#f8fafc",
    strokeColor: "#0f172a",
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    animation: "fade",
    emojiHighlights: false
  },
  karaoke_highlight: {
    fontSize: 70,
    lineHeight: 1.1,
    textColor: "#ffffff",
    strokeColor: "#111827",
    backgroundColor: "transparent",
    animation: "karaoke",
    emojiHighlights: true
  }
};

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

export function createCaptionStyle(input: { preset: CaptionPresetKey; brandColor: string; fontFamily: string }) {
  const base = presetBase[input.preset];
  return {
    preset: input.preset,
    ...base,
    fontFamily: input.fontFamily,
    backgroundColor: input.preset === "deal_pop" ? input.brandColor : base.backgroundColor
  };
}

export function createCaptionPreview(input: {
  preset: CaptionPresetKey;
  brandColor: string;
  fontFamily: string;
  segments: CaptionSegment[];
  emphasizeWords: string[];
}) {
  const style = createCaptionStyle(input);
  const emphasize = new Set(input.emphasizeWords.map((word) => word.toLowerCase()));

  return {
    style,
    segments: input.segments.map((segment) => ({
      ...segment,
      words: segment.text.split(/\s+/).map((word) => ({
        text: word,
        emphasized: emphasize.has(word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""))
      }))
    }))
  };
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
