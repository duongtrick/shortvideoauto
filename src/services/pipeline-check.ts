export function createPipelineReadinessReport(input: {
  hasScraper: boolean;
  scriptVariants: number;
  hasVoice: boolean;
  hasRenderPlan: boolean;
  hasStorageKey: boolean;
}) {
  const checks = [
    { key: "scraper", ok: input.hasScraper },
    { key: "scripts", ok: input.scriptVariants >= 3 },
    { key: "voice", ok: input.hasVoice },
    { key: "render_plan", ok: input.hasRenderPlan },
    { key: "storage", ok: input.hasStorageKey }
  ];

  return {
    ready: checks.every((check) => check.ok),
    checks,
    missing: checks.filter((check) => !check.ok).map((check) => check.key)
  };
}
