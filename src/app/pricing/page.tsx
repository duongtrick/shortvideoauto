import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatVnd, getPricingConfig } from "@/services/pricing";

export const metadata: Metadata = {
  title: "Bảng giá ShortVideoAuto",
  description: "Bảng giá dự kiến cho SaaS tạo video affiliate tự động: gói dùng thử, creator và team.",
  alternates: { canonical: "/pricing" }
};

export default async function PricingPage() {
  const pricing = await getPricingConfig(prisma);

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
        <p className="lead">Khách có thể mua theo lượt hoặc mua theo gói có thời gian và số lượt. Admin chỉnh toàn bộ trong System Settings.</p>
        <h2>Mua theo lượt</h2>
        <div className="grid">
          {pricing.creditPacks.map((pack) => (
            <article className="card" key={pack.key}>
              <strong>{pack.name}</strong>
              <h2>{formatVnd(pack.amount)}</h2>
              <p className="muted">{pack.credits.toLocaleString("vi-VN")} lượt tạo video</p>
              <p className="muted">{pack.description}</p>
              <Link className="button primary" href="/dashboard">Dùng thử</Link>
            </article>
          ))}
        </div>
        <h2>Gói theo thời gian</h2>
        <div className="grid">
          {pricing.subscriptionPlans.map((plan) => (
            <article className="card" key={plan.key}>
              <strong>{plan.name}</strong>
              <h2>{formatVnd(plan.price)}</h2>
              <p className="muted">{plan.credits.toLocaleString("vi-VN")} lượt / {plan.durationDays} ngày</p>
              <p className="muted">{plan.description}</p>
              <Link className="button primary" href="/dashboard">Chọn gói</Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
