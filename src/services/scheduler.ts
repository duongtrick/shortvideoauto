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
