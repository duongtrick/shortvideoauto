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
import { JobPreviewPanel } from "./job-preview-panel";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false }
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
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
        <h1>Tạo video affiliate</h1>
        <p className="lead">Dán link Shopee hoặc TikTok Shop. API tạo job và đưa vào BullMQ.</p>
        <div className="dashboard-grid">
          <CreateJobForm />
          <div className="dashboard-side">
            <JobPreviewPanel />
            <NotificationCenter />
            <VideoLibrary />
            <ScheduleCalendar />
            <SeriesWizard />
          </div>
        </div>
      </section>
      <nav className="bottom-nav" aria-label="Dashboard mobile">
        <a href="/dashboard">Tạo job</a>
        <a href="/samples/demo">Mẫu</a>
        <a href="/account">Tài khoản</a>
      </nav>
    </main>
  );
}
