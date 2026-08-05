export type RenderPlan = {
  compositionId: "ProductShort";
  props: {
    title: string;
    price: string;
    hook: string;
    cta: string;
  };
  output: {
    width: 1080;
    height: 1920;
    fps: 30;
    format: "mp4";
  };
};

export function createRenderPlan(input: { title?: string | null; price?: string | null }): RenderPlan {
  return {
    compositionId: "ProductShort",
    props: {
      title: input.title || "Sản phẩm đáng chú ý",
      price: input.price || "Xem giá mới nhất",
      hook: "Review nhanh trong 30 giây",
      cta: "Bấm xem deal"
    },
    output: {
      width: 1080,
      height: 1920,
      fps: 30,
      format: "mp4"
    }
  };
}
