import type { Metadata } from "next";
import { CreateJobForm } from "./create-job-form";

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
        <CreateJobForm />
      </section>
    </main>
  );
}
