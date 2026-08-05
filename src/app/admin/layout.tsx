import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/services/auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false }
};

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) redirect("/dashboard");

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar" aria-label="Admin">
        <a className="brand" href="/admin/users">
          ShortVideoAuto Admin
        </a>
        <nav className="admin-nav">
          <a href="/admin/users" aria-current="page">
            Users
          </a>
          <a href="/dashboard">Dashboard</a>
          <a href="/account">Account</a>
        </nav>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow">Admin</p>
            <h1>User management</h1>
          </div>
          <a className="badge" href="/account">
            {admin.email}
          </a>
        </header>
        {children}
      </section>
      <nav className="bottom-nav" aria-label="Admin mobile">
        <a href="/admin/users">Users</a>
        <a href="/dashboard">Dashboard</a>
        <a href="/account">Account</a>
      </nav>
    </main>
  );
}
