import { Composition } from "remotion";
import { ProductShort, type ProductShortProps } from "./ProductShort";

const defaultProps: ProductShortProps = {
  title: "Sản phẩm demo",
  price: "199.000đ",
  hook: "Deal đáng chú ý",
  cta: "Bấm xem giá hôm nay"
};

export function RemotionRoot() {
  return (
    <Composition
      id="ProductShort"
      component={ProductShort}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={defaultProps}
    />
  );
}
