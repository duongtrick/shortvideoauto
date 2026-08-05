export const jobSteps = [
  "queued",
  "scraping",
  "scripting",
  "tts",
  "rendering",
  "uploading",
  "completed",
  "failed"
] as const;

export type JobStep = (typeof jobSteps)[number];

export function isTerminalJobStep(step: JobStep) {
  return step === "completed" || step === "failed";
}
