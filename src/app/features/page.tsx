import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tính năng tạo video affiliate bằng AI",
  description: "Các tính năng ShortVideoAuto cho creator Việt: scrape link sản phẩm, viết script, TTS tiếng Việt, caption, render MP4 9:16.",
  alternates: { canonical: "/features" }
};

const features = [
  { title: "Lấy dữ liệu sản phẩm", text: "Dán link Shopee hoặc TikTok Shop để lấy tên, giá, ảnh, mô tả và rating khi có." },
  { title: "Script tiếng Việt", text: "Sinh nhiều góc kịch bản: review nhanh, deal sốc, vấn đề và giải pháp." },
  { title: "Giọng đọc và caption", text: "TTS tiếng Việt, caption lớn, giá và CTA rõ cho video bán hàng ngắn." },
  { title: "Render 9:16", text: "Xuất MP4 1080x1920 bằng template Remotion và tối ưu bằng FFmpeg." },
  { title: "Dashboard vận hành", text: "Quản lý job, video, lịch đăng thủ công, series, thông báo và credit." },
  { title: "Admin SaaS", text: "Quản lý user, job, video, thanh toán, template, provider, audit log và analytics." }
];

export default function FeaturesPage() {
  return (
    <main className="shell">
      <header className="topbar">
        <Link className="brand" href="/">ShortVideoAuto</Link>
        <nav className="nav" aria-label="Chính">
          <Link href="/features">Tính năng</Link>
          <Link href="/pricing">Bảng giá</Link>
          <Link href="/samples/demo">Mẫu video</Link>
          <Link href="/login">Đăng nhập</Link>
        </nav>
      </header>
      <section className="page">
        <p className="eyebrow">Public SEO page</p>
        <h1>Tính năng tạo video affiliate bằng AI</h1>
        <p className="lead">Khách xem được toàn bộ mô tả sản phẩm trước khi đăng nhập. Dashboard chỉ mở sau khi tạo tài khoản.</p>
        <div className="actions">
          <Link className="button primary" href="/dashboard">Dùng thử</Link>
          <Link className="button" href="/pricing">Xem bảng giá</Link>
        </div>
        <div className="grid">
          {features.map((feature) => (
            <article className="card" key={feature.title}>
              <strong>{feature.title}</strong>
              <p className="muted">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
