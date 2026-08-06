import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bảng giá ShortVideoAuto",
  description: "Bảng giá dự kiến cho SaaS tạo video affiliate tự động: gói dùng thử, creator và team.",
  alternates: { canonical: "/pricing" }
};

const plans = [
  { name: "Dùng thử", price: "0đ", text: "Tạo thử video mẫu, kiểm tra workflow và chất lượng template." },
  { name: "Creator", price: "Theo credit", text: "Phù hợp affiliate cá nhân cần tạo video Shopee/TikTok Shop hằng ngày." },
  { name: "Team", price: "Liên hệ", text: "Dành cho đội vận hành nhiều niche, nhiều template, nhiều tài khoản." }
];

export default function PricingPage() {
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
        <p className="eyebrow">Pricing</p>
        <h1>Bảng giá ShortVideoAuto</h1>
        <p className="lead">Public pricing giúp khách hiểu chi phí trước khi tạo tài khoản. Thanh toán production bám credit và subscription trong dashboard.</p>
        <div className="grid">
          {plans.map((plan) => (
            <article className="card" key={plan.name}>
              <strong>{plan.name}</strong>
              <h2>{plan.price}</h2>
              <p className="muted">{plan.text}</p>
              <Link className="button primary" href="/dashboard">Dùng thử</Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
