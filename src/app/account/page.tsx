import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { getCurrentUser } from "@/services/auth";
import { AccountForm } from "./account-form";
import { ReferralPanel } from "./referral-panel";

export const metadata: Metadata = {
  title: "Tài khoản",
  robots: { index: false, follow: false }
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.email && process.env.ALLOW_DEMO_AUTH !== "true") redirect("/login");

  const user = await getCurrentUser();
  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="/">
          ShortVideoAuto
        </a>
        <a className="badge" href="/dashboard">
          Dashboard
        </a>
      </header>
      <section className="page">
        <h1>Quản lý tài khoản</h1>
        <p className="lead">Đổi mật khẩu, xem email đăng nhập và đăng xuất.</p>
        <AccountForm email={user.email} />
        <div className="account-stack">
          <ReferralPanel />
        </div>
      </section>
    </main>
  );
}
