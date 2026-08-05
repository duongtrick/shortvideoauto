import { assertPublicDns, parseProductUrl } from "@/lib/product-url";

export type ScrapedProduct = {
  url: string;
  host: string;
  title: string;
  price: string;
  imageUrls: string[];
  description: string;
  rating?: string;
};

export async function scrapeProduct(sourceUrl: string): Promise<ScrapedProduct> {
  const { normalizedUrl, host } = parseProductUrl(sourceUrl);
  await assertPublicDns(host);

  // ponytail: demo scraper only; replace with API/HTML/Playwright adapters once selectors are verified.
  return {
    url: normalizedUrl,
    host,
    title: "Sản phẩm demo",
    price: "199.000đ",
    imageUrls: [],
    description: "Dữ liệu demo cho MVP trước khi bật scraper thật.",
    rating: "4.8"
  };
}
