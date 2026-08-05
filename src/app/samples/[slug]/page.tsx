import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mẫu video affiliate",
  description: "Trang mẫu public có canonical URL cho video affiliate tạo bằng AI."
};

export default function SampleVideoPage({ params }: { params: { slug: string } }) {
  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="/">
          ShortVideoAuto
        </a>
        <span className="badge">Public sample</span>
      </header>
      <section className="page hero">
        <div>
          <p className="eyebrow">Mẫu public</p>
          <h1>Video {params.slug}</h1>
          <p className="lead">
            Trang mẫu phục vụ SEO, chia sẻ video, canonical URL và Open Graph preview sau khi có file
            render thật.
          </p>
        </div>
        <div className="preview panel">
          <div className="video-frame">MP4 preview</div>
          <div>
            <div className="price">CTA: Mua ngay</div>
            <p className="muted">Signed URL sẽ dùng cho download riêng tư.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
