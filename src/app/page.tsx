import Link from "next/link";

const features = [
  "Lấy thông tin sản phẩm từ link Shopee/TikTok Shop",
  "Sinh 3 kịch bản tiếng Việt theo góc bán hàng",
  "Render MP4 1080x1920 bằng Remotion và FFmpeg"
];

export default function HomePage() {
  return (
    <main className="shell">
      <header className="topbar">
        <Link className="brand" href="/">
          ShortVideoAuto
        </Link>
        <nav className="nav" aria-label="Chính">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/samples/demo">Mẫu video</Link>
        </nav>
      </header>
      <section className="page hero">
        <div>
          <p className="eyebrow">AI video affiliate cho thị trường Việt Nam</p>
          <h1>ShortVideoAuto</h1>
          <p className="lead">
            Dán link sản phẩm, nhận short video 9:16 có script tiếng Việt, voice, caption, giá và CTA.
            MVP tập trung download MP4 trước khi mở auto-post.
          </p>
          <div className="actions">
            <Link className="button primary" href="/dashboard">
              Tạo video
            </Link>
            <Link className="button" href="/samples/demo">
              Xem mẫu
            </Link>
          </div>
        </div>
        <div className="preview panel" aria-label="Khung xem trước video 9:16">
          <div>
            <p className="badge">1080 x 1920</p>
            <h2>Deal đáng chú ý hôm nay</h2>
          </div>
          <div className="video-frame">Ảnh sản phẩm</div>
          <div>
            <div className="price">199.000đ</div>
            <p className="muted">Caption lớn, nhạc nền ducking, CTA rõ.</p>
          </div>
        </div>
      </section>
      <section className="page">
        <h2>Luồng MVP</h2>
        <div className="grid">
          {features.map((feature) => (
            <article className="card" key={feature}>
              <strong>{feature}</strong>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
