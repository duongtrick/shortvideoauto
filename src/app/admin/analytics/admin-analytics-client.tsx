"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

type AdminStats = {
  users: number;
  jobs: number;
  videos: number;
  failedJobs: number;
  paidPayments: number;
  auditLogs: number;
  emailDeliveries: number;
  failedEmailDeliveries: number;
  pendingEmailDeliveries: number;
  revenueVnd: number;
  creditsSold: number;
};

const emptyStats: AdminStats = {
  users: 0,
  jobs: 0,
  videos: 0,
  failedJobs: 0,
  paidPayments: 0,
  auditLogs: 0,
  emailDeliveries: 0,
  failedEmailDeliveries: 0,
  pendingEmailDeliveries: 0,
  revenueVnd: 0,
  creditsSold: 0
};

export function AdminAnalyticsClient() {
  const [stats, setStats] = useState<AdminStats>(emptyStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/stats")
      .then((response) => response.json())
      .then((data: AdminStats) => {
        if (active) setStats(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const jobFailureRate = stats.jobs ? Math.round((stats.failedJobs / stats.jobs) * 100) : 0;
  const emailFailureRate = stats.emailDeliveries ? Math.round((stats.failedEmailDeliveries / stats.emailDeliveries) * 100) : 0;

  return (
    <div className="admin-users">
      <section className="admin-kpi-grid" aria-label="Admin KPIs">
        <Kpi label="Users" value={stats.users.toLocaleString("vi-VN")} loading={loading} />
        <Kpi label="Jobs" value={stats.jobs.toLocaleString("vi-VN")} loading={loading} />
        <Kpi label="Videos" value={stats.videos.toLocaleString("vi-VN")} loading={loading} />
        <Kpi label="Revenue" value={`${stats.revenueVnd.toLocaleString("vi-VN")} VND`} loading={loading} />
        <Kpi label="Paid payments" value={stats.paidPayments.toLocaleString("vi-VN")} loading={loading} />
        <Kpi label="Credits sold" value={stats.creditsSold.toLocaleString("vi-VN")} loading={loading} />
        <Kpi label="Audit logs" value={stats.auditLogs.toLocaleString("vi-VN")} loading={loading} />
        <Kpi label="Email queue" value={stats.pendingEmailDeliveries.toLocaleString("vi-VN")} loading={loading} />
      </section>

      <section className="grid">
        <div className="panel">
          <h2>Render health</h2>
          <p className="lead">{jobFailureRate}% failed jobs</p>
          <div className="admin-meter" style={{ "--meter": `${Math.min(jobFailureRate, 100)}%` } as CSSProperties} />
          <p className="muted">{stats.failedJobs} failed out of {stats.jobs} jobs.</p>
        </div>
        <div className="panel">
          <h2>Email health</h2>
          <p className="lead">{emailFailureRate}% failed deliveries</p>
          <div className="admin-meter" style={{ "--meter": `${Math.min(emailFailureRate, 100)}%` } as CSSProperties} />
          <p className="muted">{stats.failedEmailDeliveries} failed, {stats.pendingEmailDeliveries} pending.</p>
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, loading }: { label: string; value: string; loading: boolean }) {
  return (
    <article className="card admin-kpi">
      <span className="muted">{label}</span>
      <strong>{loading ? "..." : value}</strong>
    </article>
  );
}
