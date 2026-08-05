type ThumbnailInput = {
  title: string;
  price?: string | null;
  imageUrl?: string | null;
  accent?: string | null;
};

export function createThumbnailPlan(input: ThumbnailInput) {
  const title = input.title.trim().slice(0, 80);

  return {
    width: 1080,
    height: 1920,
    format: "png",
    layers: [
      { type: "background", color: "#0f172a" },
      { type: "image", src: input.imageUrl ?? null, fit: "contain", box: { x: 120, y: 260, width: 840, height: 760 } },
      { type: "text", text: title, fontSize: 86, color: "#ffffff", box: { x: 96, y: 1120, width: 888, height: 260 } },
      {
        type: "badge",
        text: input.price ?? "Deal hot",
        fontSize: 72,
        color: "#ffffff",
        background: input.accent ?? "#ff6b35",
        box: { x: 96, y: 1420, width: 620, height: 132 }
      }
    ],
    alt: `${title} thumbnail`
  };
}
