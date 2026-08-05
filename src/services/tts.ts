import { createHash } from "node:crypto";

export type VoiceResult = {
  provider: string;
  voice: string;
  language: "vi-VN";
  storageKey: string;
  durationMs?: number;
};

export async function synthesizeVietnameseSpeech(text: string): Promise<VoiceResult> {
  const id = createHash("sha256").update(text).digest("hex").slice(0, 16);

  // ponytail: placeholder asset; replace with FPT.AI/Viettel/Zalo provider once keys exist.
  return {
    provider: "placeholder",
    voice: "vi-VN-demo",
    language: "vi-VN",
    storageKey: `voice/${id}.mp3`
  };
}
