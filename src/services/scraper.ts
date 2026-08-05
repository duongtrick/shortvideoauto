import { assertPublicDns, parseProductUrl } from "@/lib/product-url";

export type ProductPlatform = "shopee" | "tiktok_shop";

export type ScrapedProduct = {
  url: string;
  host: string;
  platform: ProductPlatform;
  title: string;
  price: string;
  imageUrls: string[];
  description: string;
  rating?: string;
};

export async function scrapeProduct(sourceUrl: string): Promise<ScrapedProduct> {
  const { normalizedUrl, host } = parseProductUrl(sourceUrl);
  await assertPublicDns(host);

  if (host.includes("tiktok")) return scrapeTikTokShop(normalizedUrl, host);
  return scrapeShopee(normalizedUrl, host);
}

export function sanitizeScrapedText(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 2000);
}

async function scrapeShopee(url: string, host: string): Promise<ScrapedProduct> {
  // ponytail: demo adapter only; replace with Shopee API/HTML/Playwright selectors after selector QA.
  return {
    url,
    host,
    platform: "shopee",
    title: "San pham Shopee demo",
    price: "199.000 VND",
    imageUrls: [],
    description: sanitizeScrapedText("Du lieu demo cho MVP truoc khi bat scraper that."),
    rating: "4.8"
  };
}

async function scrapeTikTokShop(url: string, host: string): Promise<ScrapedProduct> {
  // ponytail: demo adapter only; replace with TikTok Shop API/HTML/Playwright selectors after selector QA.
  return {
    url,
    host,
    platform: "tiktok_shop",
    title: "San pham TikTok Shop demo",
    price: "199.000 VND",
    imageUrls: [],
    description: sanitizeScrapedText("Du lieu demo cho MVP truoc khi bat scraper that."),
    rating: "4.8"
  };
}
