export function getSeriesCadenceIntervalHours(cadence: string) {
  if (cadence === "twice_daily") return 12;
  if (cadence === "daily") return 24;
  return 56;
}

export function createNextSeriesRun(input: {
  seriesId: string;
  cadence: string;
  lastJobCreatedAt?: Date | null;
  now?: Date;
  hasCredits: boolean;
}) {
  const now = input.now ?? new Date();
  const intervalHours = getSeriesCadenceIntervalHours(input.cadence);
  const base = input.lastJobCreatedAt ?? now;
  const nextAt = new Date(base.getTime() + intervalHours * 60 * 60 * 1000);

  return {
    seriesId: input.seriesId,
    nextAt: nextAt.toISOString(),
    intervalHours,
    canQueueNow: input.hasCredits && nextAt <= now,
    blockedReason: input.hasCredits ? null : "insufficient_credits"
  };
}
