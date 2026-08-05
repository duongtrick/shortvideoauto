"use client";

import { useEffect, useMemo, useState } from "react";

type JobStatus = "queued" | "scraping" | "scripting" | "tts" | "rendering" | "uploading" | "completed" | "failed";

type JobRow = {
  id: string;
  status: JobStatus;
  sourceUrl: string;
  errorCode: string | null;
  errorMessage: string | null;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  user: { id: string; email: string };
  productSource: { title: string | null; price: string | null } | null;
  outputVideo: { publicSlug: string; storageKey: string } | null;
};

type JobsResponse = {
  jobs: JobRow[];
};

const statuses: JobStatus[] = ["queued", "scraping", "scripting", "tts", "rendering", "uploading", "completed", "failed"];

export function AdminJobsClient() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => {
    const params = new URLSearchParams({ take: "50" });
    if (status) params.set("status", status);
    return params.toString();
  }, [status]);

  async function loadJobs() {
    setLoading(true);
    const response = await fetch(`/api/admin/jobs?${query}`);
    const data = (await response.json()) as JobsResponse;
    setJobs(data.jobs ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadJobs();
  }, [query]);

  async function retryJob(job: JobRow) {
    const response = await fetch(`/api/admin/jobs/${job.id}/retry`, { method: "POST" });
    setMessage(response.ok ? "Job re-queued." : "Retry failed.");
    await loadJobs();
  }

  async function sendStaleAlerts() {
    const response = await fetch("/api/admin/jobs/stale-alerts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ olderThanMinutes: 30, take: 20 })
    });
    const data = (await response.json().catch(() => ({}))) as { alertedJobIds?: string[] };
    setMessage(response.ok ? `Alerted ${data.alertedJobIds?.length ?? 0} jobs.` : "Stale alert failed.");
  }

  return (
    <div className="admin-users">
      <section className="panel admin-command">
        <div className="admin-toolbar">
          <label>
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">all</option>
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <button className="button" type="button" onClick={sendStaleAlerts}>
            Send stale alerts
          </button>
          <p className="muted">{loading ? "Loading..." : `${jobs.length} jobs`}</p>
        </div>
        {message ? <p className="badge">{message}</p> : null}
      </section>

      <section className="admin-user-list" aria-label="Jobs">
        {jobs.length === 0 && !loading ? <div className="panel muted">No jobs found.</div> : null}
        {jobs.map((job) => (
          <article className="card admin-job-row" key={job.id}>
            <div className="admin-user-main">
              <strong>{job.productSource?.title ?? job.id}</strong>
              <span className="badge">{job.status}</span>
              <span className="muted">{job.user.email}</span>
            </div>
            <div className="admin-job-url">
              <a href={job.sourceUrl} target="_blank" rel="noreferrer">
                {job.sourceUrl}
              </a>
              {job.errorCode ? <span className="muted">{job.errorCode}: {job.errorMessage}</span> : null}
            </div>
            <div className="admin-user-actions">
              <span className="muted">Attempts {job.attempts}</span>
              <span className="muted">{new Date(job.updatedAt).toLocaleString()}</span>
              {job.outputVideo ? (
                <a className="button" href={`/samples/${job.outputVideo.publicSlug}`}>
                  View
                </a>
              ) : null}
              <button className="button" type="button" disabled={job.status !== "failed"} onClick={() => retryJob(job)}>
                Retry
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
