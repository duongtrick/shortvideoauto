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
        <h1>Tao video affiliate</h1>
        <p className="lead">Dan link Shopee hoac TikTok Shop. API tao job va dua vao BullMQ.</p>
        <CreateJobForm />
      </section>
      <nav className="bottom-nav" aria-label="Dashboard mobile">
        <a href="/dashboard">Tao job</a>
        <a href="/samples/demo">Mau</a>
        <a href="/">Home</a>
      </nav>
    </main>
  );
}
