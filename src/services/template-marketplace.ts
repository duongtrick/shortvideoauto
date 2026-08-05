import type { VideoTemplate } from "@prisma/client";

type TemplateConfig = Record<string, unknown>;

type TemplatePreview = {
  key: string;
  name: string;
  category: string;
  platforms: string[];
  tags: string[];
  planRequired: string;
  thumbnailUrl: string | null;
  sampleOutputUrl: string | null;
  aspectRatio: "9:16";
  accent: string | null;
};

function asConfig(config: unknown): TemplateConfig {
  return config && typeof config === "object" && !Array.isArray(config) ? (config as TemplateConfig) : {};
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

export function createTemplatePreview(template: Pick<VideoTemplate, "key" | "name" | "config">): TemplatePreview {
  const config = asConfig(template.config);
  const platforms = stringList(config.platforms);

  return {
    key: template.key,
    name: template.name,
    category: stringValue(config.category) ?? "affiliate",
    platforms: platforms.length ? platforms : ["tiktok", "shopee"],
    tags: stringList(config.tags),
    planRequired: stringValue(config.planRequired) ?? "free",
    thumbnailUrl: stringValue(config.thumbnailUrl),
    sampleOutputUrl: stringValue(config.sampleOutputUrl),
    aspectRatio: "9:16",
    accent: stringValue(config.accent)
  };
}

export function filterTemplatePreviews(
  previews: TemplatePreview[],
  filters: { category?: string; platform?: string; search?: string; take: number }
) {
  const category = filters.category?.toLowerCase();
  const platform = filters.platform?.toLowerCase();
  const search = filters.search?.toLowerCase();

  return previews
    .filter((template) => !category || template.category.toLowerCase() === category)
    .filter((template) => !platform || template.platforms.some((item) => item.toLowerCase() === platform))
    .filter(
      (template) =>
        !search ||
        template.name.toLowerCase().includes(search) ||
        template.tags.some((tag) => tag.toLowerCase().includes(search))
    )
    .slice(0, filters.take);
}
