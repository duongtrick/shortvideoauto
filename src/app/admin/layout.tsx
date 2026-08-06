import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/services/auth";
import { AdminTitle } from "./title";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false }
};

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) redirect("/login?callbackUrl=/admin");

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar" aria-label="Admin">
        <a className="brand" href="/admin/users">
          ShortVideoAuto Admin
        </a>
        <nav className="admin-nav">
          <a href="/admin/users">Users</a>
          <a href="/admin/jobs">Jobs</a>
          <a href="/admin/videos">Videos</a>
          <a href="/admin/payments">Payments</a>
          <a href="/admin/subscriptions">Subscriptions</a>
          <a href="/admin/templates">Templates</a>
          <a href="/admin/series">Series</a>
          <a href="/admin/tts">TTS</a>
          <a href="/admin/ai">AI</a>
          <a href="/admin/settings">Settings</a>
          <a href="/admin/audit-logs">Audit logs</a>
          <a href="/admin/analytics">Analytics</a>
          <a href="/dashboard">Dashboard</a>
          <a href="/account">Account</a>
        </nav>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow">Admin</p>
            <AdminTitle />
          </div>
          <a className="badge" href="/account">
            {admin.email}
          </a>
        </header>
        {children}
      </section>
      <nav className="bottom-nav" aria-label="Admin mobile">
        <a href="/admin/users">Users</a>
        <a href="/admin/jobs">Jobs</a>
        <a href="/admin/videos">Videos</a>
      </nav>
    </main>
  );
}
