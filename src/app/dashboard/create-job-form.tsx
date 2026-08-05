"use client";

import { useEffect, useState, useTransition } from "react";
import { useRef } from "react";

type JobRow = {
  id: string;
  status: string;
  sourceUrl: string;
  errorMessage?: string | null;
  createdAt: string;
  outputVideo?: { publicSlug: string; storageKey: string } | null;
  productSource?: { title: string | null; price: string | null } | null;
};

function downloadPath(job: JobRow) {
  if (!job.outputVideo) return null;
  return `/samples/${job.outputVideo.publicSlug}`;
}

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
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey && event.key.toLowerCase() === "n") {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.ctrlKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
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

  const filteredJobs = jobs.filter((job) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [job.id, job.status, job.sourceUrl, job.productSource?.title, job.productSource?.price]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

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
            ref={inputRef}
            id="url"
            name="url"
            type="url"
            autoComplete="url"
            inputMode="url"
            placeholder="https://shopee.vn/..."
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onPaste={() => setMessage("Da dan link. Kiem tra nhanh roi tao job.")}
          />
          <button className="button primary sticky-mobile-cta" type="submit" disabled={isPending}>
            {isPending ? "Đang tạo" : "Tạo job"}
          </button>
        </div>
        {message ? <p className="muted">{message}</p> : null}
      </form>
      <div className="panel status-list" aria-label="Job render gần đây">
        <div className="input-row">
          <input
            ref={searchRef}
            type="search"
            placeholder="Tim job, status, san pham"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Tim job"
          />
          <span className="badge">Ctrl+K</span>
        </div>
        {filteredJobs.length === 0 ? (
          <div className="status-item">
            <span>Chưa có job</span>
            <span className="badge">empty</span>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div className="status-item" key={job.id}>
              <div>
                <strong>
                  {downloadPath(job) ? (
                    <a href={downloadPath(job) ?? "#"}>{job.productSource?.title ?? job.sourceUrl}</a>
                  ) : (
                    (job.productSource?.title ?? job.sourceUrl)
                  )}
                </strong>
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
