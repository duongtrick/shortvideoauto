"use client";

import { useEffect, useState, useTransition } from "react";

type JobRow = {
  id: string;
  status: string;
  sourceUrl: string;
  errorMessage?: string | null;
  createdAt: string;
  outputVideo?: { publicSlug: string; storageKey: string } | null;
  productSource?: { title: string | null; price: string | null } | null;
};

async function loadJobs(): Promise<JobRow[]> {
  const response = await fetch("/api/jobs", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Không tải được job.");
  }
  const data = (await response.json()) as { jobs: JobRow[] };
  return data.jobs;
}

export function CreateJobForm() {
  const [url, setUrl] = useState("");
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;

    async function tick() {
      try {
        const nextJobs = await loadJobs();
        if (active) setJobs(nextJobs);
      } catch {
        if (active) setMessage("Chưa kết nối database hoặc API.");
      }
    }

    void tick();
    const timer = window.setInterval(tick, 5000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  function createJob() {
    setMessage("");
    startTransition(async () => {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url })
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(data.error ?? "Tạo job thất bại.");
        return;
      }
      setUrl("");
      setJobs(await loadJobs());
      setMessage("Đã đưa video vào hàng đợi render.");
    });
  }

  return (
    <>
      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault();
          createJob();
        }}
      >
        <label htmlFor="url">Link sản phẩm</label>
        <div className="input-row">
          <input
            id="url"
            name="url"
            type="url"
            placeholder="https://shopee.vn/..."
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
          <button className="button primary" type="submit" disabled={isPending}>
            {isPending ? "Đang tạo" : "Tạo job"}
          </button>
        </div>
        {message ? <p className="muted">{message}</p> : null}
      </form>
      <div className="panel status-list" aria-label="Job render gần đây">
        {jobs.length === 0 ? (
          <div className="status-item">
            <span>Chưa có job</span>
            <span className="badge">empty</span>
          </div>
        ) : (
          jobs.map((job) => (
            <div className="status-item" key={job.id}>
              <div>
                <strong>{job.productSource?.title ?? job.sourceUrl}</strong>
                <p className="muted">{job.errorMessage ?? job.productSource?.price ?? job.id}</p>
              </div>
              <span className="badge">{job.status}</span>
            </div>
          ))
        )}
      </div>
    </>
  );
}
