import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { getCurrentUser } from "@/services/auth";
import { AccountForm } from "./account-form";
import { ReferralPanel } from "./referral-panel";

export const metadata: Metadata = {
  title: "Tai khoan",
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
        <h1>Quan ly tai khoan</h1>
        <p className="lead">Doi mat khau, xem email dang nhap va dang xuat.</p>
        <AccountForm email={user.email} />
        <div className="account-stack">
          <ReferralPanel />
        </div>
      </section>
    </main>
  );
}
