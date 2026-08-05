import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { getCurrentUser } from "@/services/auth";
import { CreateJobForm } from "./create-job-form";
import { SignOutButton } from "./session-actions";
import { NotificationCenter } from "./notification-center";
import { VideoLibrary } from "./video-library";
import { ScheduleCalendar } from "./schedule-calendar";
import { SeriesWizard } from "./series-wizard";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false }
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.email && process.env.ALLOW_DEMO_AUTH !== "true") redirect("/login");
  const user = await getCurrentUser();

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="/">
          ShortVideoAuto
        </a>
        <div className="actions">
          <a className="badge" href="/account">
            {user.email}
          </a>
          <SignOutButton />
        </div>
      </header>
      <section className="page">
        <h1>Tao video affiliate</h1>
        <p className="lead">Dan link Shopee hoac TikTok Shop. API tao job va dua vao BullMQ.</p>
        <div className="dashboard-grid">
          <CreateJobForm />
          <div className="dashboard-side">
            <NotificationCenter />
            <VideoLibrary />
            <ScheduleCalendar />
            <SeriesWizard />
          </div>
        </div>
      </section>
      <nav className="bottom-nav" aria-label="Dashboard mobile">
        <a href="/dashboard">Tao job</a>
        <a href="/samples/demo">Mau</a>
        <a href="/account">Tai khoan</a>
      </nav>
    </main>
  );
}
