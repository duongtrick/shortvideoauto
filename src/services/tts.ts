import { createPlaceholderVoice, getTtsProviderChain, synthesizeWithProvider } from "./tts-providers";

export type VoiceResult = {
  provider: string;
  voice: string;
  language: "vi-VN";
  storageKey: string;
  durationMs?: number;
};

export async function synthesizeVietnameseSpeech(text: string): Promise<VoiceResult> {
  for (const provider of getTtsProviderChain()) {
    const voice = await synthesizeWithProvider(provider, text).catch(() => null);
    if (voice) return voice;
  }

  return createPlaceholderVoice(text);
}
