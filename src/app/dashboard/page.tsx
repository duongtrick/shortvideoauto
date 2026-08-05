import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false }
};

export default function DashboardPage() {
  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="/">
          ShortVideoAuto
        </a>
        <span className="badge">Demo user</span>
      </header>
      <section className="page">
        <h1>Tạo video affiliate</h1>
        <p className="lead">Dán link Shopee hoặc TikTok Shop. API sẽ tạo job và đưa vào BullMQ.</p>
        <form className="form" action="/api/jobs" method="post">
          <label htmlFor="url">Link sản phẩm</label>
          <div className="input-row">
            <input id="url" name="url" type="url" placeholder="https://shopee.vn/..." required />
            <button className="button primary" type="submit">
              Tạo job
            </button>
          </div>
        </form>
        <div className="panel status-list" aria-label="Trạng thái render">
          {["queued", "scraping", "scripting", "tts", "rendering", "uploading", "completed"].map(
            (step) => (
              <div className="status-item" key={step}>
                <span>{step}</span>
                <span className="badge">ready</span>
              </div>
            )
          )}
        </div>
      </section>
    </main>
  );
}
