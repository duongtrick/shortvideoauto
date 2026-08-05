const defaultVoicePreviews = [
  { key: "fpt_banmai", provider: "fpt", name: "Ban Mai", language: "vi-VN", region: "north", sampleText: "Deal hom nay dang rat dang chu y." },
  { key: "viettel_miennam", provider: "viettel", name: "Nu mien Nam", language: "vi-VN", region: "south", sampleText: "Bam xem deal truoc khi het." },
  { key: "zalo_north", provider: "zalo", name: "Giong Bac", language: "vi-VN", region: "north", sampleText: "Review nhanh san pham nay." }
];

const defaultMusicPreviews = [
  { key: "summer_deal", name: "Summer Deal", mood: "bright", bpm: 118, safeForCommercial: true },
  { key: "tech_pop", name: "Tech Pop", mood: "modern", bpm: 124, safeForCommercial: true },
  { key: "story_soft", name: "Story Soft", mood: "calm", bpm: 92, safeForCommercial: true }
];

export function listMediaPreviews(input: { type?: "voice" | "music"; language?: string }) {
  const voices = defaultVoicePreviews.filter((voice) => !input.language || voice.language === input.language);
  const music = defaultMusicPreviews;

  if (input.type === "voice") return { voices, music: [] };
  if (input.type === "music") return { voices: [], music };
  return { voices, music };
}
