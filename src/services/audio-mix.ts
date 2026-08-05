import type { z } from "zod";
import type { musicDuckingPreset } from "@/lib/audio-mix-validation";

type MusicDuckingPreset = z.infer<typeof musicDuckingPreset>;

const duckingLevels: Record<MusicDuckingPreset, { threshold: number; ratio: number; attack: number; release: number }> = {
  soft: { threshold: 0.08, ratio: 4, attack: 80, release: 600 },
  normal: { threshold: 0.06, ratio: 8, attack: 50, release: 450 },
  aggressive: { threshold: 0.04, ratio: 12, attack: 30, release: 320 }
};

export function createMusicDuckingPlan(input: {
  voicePath: string;
  musicPath: string;
  outputPath: string;
  preset: MusicDuckingPreset;
  musicVolume: number;
}) {
  const level = duckingLevels[input.preset];
  const filter = [
    `[1:a]volume=${input.musicVolume.toFixed(2)}[music]`,
    `[music][0:a]sidechaincompress=threshold=${level.threshold}:ratio=${level.ratio}:attack=${level.attack}:release=${level.release}[ducked]`,
    `[0:a][ducked]amix=inputs=2:duration=first:dropout_transition=0[aout]`
  ].join(";");

  return {
    preset: input.preset,
    filter,
    ffmpegArgs: [
      "-y",
      "-i",
      input.voicePath,
      "-i",
      input.musicPath,
      "-filter_complex",
      filter,
      "-map",
      "[aout]",
      "-c:a",
      "aac",
      "-b:a",
      "160k",
      input.outputPath
    ]
  };
}
