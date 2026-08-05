import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export type ProductShortProps = {
  title: string;
  price: string;
  hook: string;
  cta: string;
};

export function ProductShort({ title, price, hook, cta }: ProductShortProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18 } });
  const captionY = interpolate(enter, [0, 1], [80, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#f7f8fb",
        color: "#172033",
        fontFamily: "Arial, Helvetica, sans-serif",
        padding: 72,
        justifyContent: "space-between"
      }}
    >
      <div style={{ transform: `translateY(${captionY}px)` }}>
        <div style={{ color: "#0f766e", fontSize: 42, fontWeight: 800 }}>{hook}</div>
        <h1 style={{ fontSize: 78, lineHeight: 1.05, margin: "28px 0 0" }}>{title}</h1>
      </div>
      <div
        style={{
          height: 760,
          border: "4px solid #d9e0ea",
          borderRadius: 24,
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 44,
          color: "#647084"
        }}
      >
        Ảnh sản phẩm
      </div>
      <div>
        <div style={{ color: "#b42318", fontSize: 82, fontWeight: 900 }}>{price}</div>
        <div style={{ marginTop: 18, fontSize: 48, fontWeight: 800 }}>{cta}</div>
      </div>
    </AbsoluteFill>
  );
}
