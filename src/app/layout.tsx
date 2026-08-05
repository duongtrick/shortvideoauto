import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: {
    default: "ShortVideoAuto - AI tạo video affiliate tiếng Việt",
    template: "%s | ShortVideoAuto"
  },
  description:
    "Tạo video Shopee affiliate và TikTok Shop 9:16 bằng AI, giọng đọc tiếng Việt, caption lớn và CTA sẵn dùng.",
  openGraph: {
    title: "ShortVideoAuto",
    description: "AI tạo short video affiliate tiếng Việt từ link sản phẩm.",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
