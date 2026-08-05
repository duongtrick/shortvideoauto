import { createHash } from "node:crypto";
import type { VoiceResult } from "./tts";

type TtsProvider = {
  name: "fpt" | "viettel" | "zalo" | "openai";
  key: string;
};

export function getTtsProviderChain(): TtsProvider[] {
  const providers = [
    { name: "fpt", key: process.env.FPT_AI_API_KEY ?? "" },
    { name: "viettel", key: process.env.VIETTEL_AI_API_KEY ?? "" },
    { name: "zalo", key: process.env.ZALO_TTS_COOKIE ?? "" },
    { name: "openai", key: process.env.OPENAI_API_KEY ?? "" }
  ] satisfies TtsProvider[];

  return providers.filter((provider) => provider.key.length > 0);
}

export function createPlaceholderVoice(text: string): VoiceResult {
  const id = createHash("sha256").update(text).digest("hex").slice(0, 16);
  return {
    provider: "placeholder",
    voice: "vi-VN-demo",
    language: "vi-VN",
    storageKey: `voice/${id}.mp3`
  };
}

export async function synthesizeWithProvider(provider: TtsProvider, text: string): Promise<VoiceResult> {
  if (provider.name === "fpt") return synthesizeFpt(provider.key, text);
  if (provider.name === "viettel") return synthesizeViettel(provider.key, text);
  if (provider.name === "zalo") return synthesizeZalo(provider.key, text);
  return synthesizeOpenAi(provider.key, text);
}

async function synthesizeFpt(key: string, text: string): Promise<VoiceResult> {
  const response = await fetch("https://api.fpt.ai/hmi/tts/v5", {
    method: "POST",
    headers: {
      "api-key": key,
      voice: "banmai",
      speed: "0",
      "content-type": "text/plain"
    },
    body: text
  });
  if (!response.ok) throw new Error("FPT.AI TTS request failed.");
  const data = (await response.json()) as { async?: string };
  if (!data.async) throw new Error("FPT.AI TTS did not return audio URL.");
  return {
    provider: "fpt",
    voice: "banmai",
    language: "vi-VN",
    storageKey: data.async
  };
}

async function synthesizeViettel(_: string, text: string): Promise<VoiceResult> {
  // ponytail: provider contract only; add Viettel endpoint mapping after account docs are available.
  return createPlaceholderVoice(`viettel:${text}`);
}

async function synthesizeZalo(_: string, text: string): Promise<VoiceResult> {
  // ponytail: provider contract only; add Zalo request format after cookie/session policy is approved.
  return createPlaceholderVoice(`zalo:${text}`);
}

async function synthesizeOpenAi(_: string, text: string): Promise<VoiceResult> {
  // ponytail: provider contract only; add binary upload path when storage SDK exists.
  return createPlaceholderVoice(`openai:${text}`);
}
