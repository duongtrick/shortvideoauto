import type { ScrapedProduct } from "./scraper";

export type ScriptDraft = {
  angle: "review nhanh" | "deal sốc" | "vấn đề - giải pháp";
  content: string;
  score: number;
};

export async function writeVietnameseScripts(product: ScrapedProduct): Promise<ScriptDraft[]> {
  const title = product.title;
  const price = product.price;

  // ponytail: deterministic drafts; replace with AI provider call after prompt eval set exists.
  return [
    {
      angle: "review nhanh",
      content: `${title} hợp nếu bạn cần giải pháp gọn, giá ${price}, dễ dùng mỗi ngày.`,
      score: 85
    },
    {
      angle: "deal sốc",
      content: `Deal hôm nay đáng chú ý: ${title} đang có giá ${price}, chốt sớm kẻo hết mã.`,
      score: 80
    },
    {
      angle: "vấn đề - giải pháp",
      content: `Bạn đang mất thời gian chọn đồ? ${title} giải quyết nhanh với chi phí thấp.`,
      score: 78
    }
  ];
}
