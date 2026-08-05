export function estimateTikTokAccount(input: {
  followers: number;
  likes: number;
  avgViews: number;
  engagementRate?: number;
}) {
  const engagementRate =
    input.engagementRate ?? (input.followers > 0 ? Math.min(100, (input.likes / input.followers) * 0.02) : 0);
  const lowUsd = Math.round(input.avgViews * 0.0002 * 100) / 100;
  const highUsd = Math.round(input.avgViews * 0.001 * 100) / 100;
  const affiliatePotentialScore = Math.min(
    100,
    Math.round(input.followers / 1000 + engagementRate * 4 + input.avgViews / 10000)
  );

  return {
    engagementRate,
    estimatedPostValueUsd: { low: lowUsd, high: highUsd },
    affiliatePotentialScore
  };
}
