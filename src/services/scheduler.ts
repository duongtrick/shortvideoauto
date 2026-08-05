export function createManualPublishChecklist(platform: string) {
  return {
    platform,
    steps: [
      "Download MP4",
      "Copy caption and hashtags",
      "Open platform upload screen",
      "Paste caption",
      "Confirm affiliate disclosure",
      "Publish or schedule manually"
    ]
  };
}

const platformHashtags: Record<string, string[]> = {
  tiktok: ["#tiktokshop", "#shopeefinds", "#dealhot", "#reviewthat"],
  youtube_shorts: ["#shorts", "#review", "#dealhot"],
  instagram_reels: ["#reels", "#reviewsanpham", "#dealhot"],
  facebook_reels: ["#reels", "#muasamthongminh", "#dealhot"],
  x: ["#deal", "#affiliate"],
  linkedin: ["#ecommerce", "#affiliate"],
  pinterest: ["#shopping", "#deal"]
};

export function suggestScheduleCopy(input: {
  platform: string;
  tone: "deal" | "review" | "problem_solution";
  productTitle?: string | null;
  price?: string | null;
  script?: string | null;
}) {
  const title = input.productTitle?.trim() || "San pham dang hot";
  const price = input.price ? ` Gia hien tai: ${input.price}.` : "";
  const hook =
    input.tone === "review"
      ? `Review nhanh ${title}: co dang mua khong?`
      : input.tone === "problem_solution"
        ? `Neu ban dang can giai phap gon tien, xem ${title}.`
        : `Deal dang chu y: ${title}.`;
  const disclosure = "Co the co lien ket tiep thi.";
  const cta = input.platform === "linkedin" ? "Xem chi tiet truoc khi ra quyet dinh." : "Bam xem deal truoc khi het.";
  const scriptHint = input.script ? `\n${input.script.slice(0, 180)}` : "";
  const hashtags = [...new Set([...(platformHashtags[input.platform] ?? ["#dealhot"]), "#shortvideoauto"])];

  return {
    title: hook.slice(0, 120),
    caption: `${hook}${price} ${cta} ${disclosure}${scriptHint}`.slice(0, 2200),
    hashtags
  };
}

const bestLocalHours: Record<string, number[]> = {
  tiktok: [11, 19, 21],
  youtube_shorts: [12, 18, 20],
  instagram_reels: [11, 18, 21],
  facebook_reels: [8, 12, 20],
  x: [8, 12, 17],
  linkedin: [8, 10, 14],
  pinterest: [20, 21, 22]
};

export function recommendBestScheduleTimes(input: {
  platform: string;
  timezoneOffsetMinutes: number;
  daysAhead: number;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const hours = bestLocalHours[input.platform] ?? [11, 19, 21];
  const recommendations: { scheduledAt: string; localHour: number; reason: string }[] = [];

  for (let day = 0; day < input.daysAhead && recommendations.length < 10; day += 1) {
    for (const localHour of hours) {
      const utcTime = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + day, localHour, 0, 0) -
          input.timezoneOffsetMinutes * 60_000
      );
      if (utcTime <= now) continue;

      recommendations.push({
        scheduledAt: utcTime.toISOString(),
        localHour,
        reason: `${input.platform} thuong tot luc ${localHour}:00 gio dia phuong.`
      });
    }
  }

  return recommendations;
}
