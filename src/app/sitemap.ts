import type { MetadataRoute } from "next";
import { keywordPages } from "./(marketing)/keywords";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.APP_URL ?? "http://localhost:3000";

  return [
    {
      url: baseUrl,
      lastModified: new Date()
    },
    {
      url: `${baseUrl}/samples/demo`,
      lastModified: new Date()
    },
    ...keywordPages.map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: new Date()
    }))
  ];
}
