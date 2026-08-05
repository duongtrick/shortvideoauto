"use client";

import { useEffect, useMemo, useState } from "react";

type AdminVideoRow = {
  id: string;
  storageKey: string;
  publicSlug: string;
  durationMs: number | null;
  width: number;
  height: number;
  createdAt: string;
  downloadUrl: string;
  user: { id: string; email: string };
  scheduledPosts: Array<{ id: string; platform: string; status: string; scheduledAt: string }>;
  job: {
    status: string;
    sourceUrl: string;
    productSource: { title: string | null; price: string | null; host: string } | null;
    series: { name: string; templateKey: string | null; language: string } | null;
  } | null;
};

type AdminVideosResponse = {
  videos: AdminVideoRow[];
};

const statuses = ["completed", "failed", "queued", "rendering", "uploading"];

export function AdminVideosClient() {
  const [videos, setVideos] = useState<AdminVideoRow[]>([]);
  const [status, setStatus] = useState("");
  const [sourceHost, setSourceHost] = useState("");
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => {
    const params = new URLSearchParams({ take: "50" });
    if (status) params.set("status", status);
    if (sourceHost.trim()) params.set("sourceHost", sourceHost.trim());
    return params.toString();
  }, [status, sourceHost]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/admin/videos?${query}`)
      .then((response) => response.json())
      .then((data: AdminVideosResponse) => {
        if (active) setVideos(data.videos ?? []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query]);

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
          <label>
            Source host
            <input value={sourceHost} onChange={(event) => setSourceHost(event.target.value)} placeholder="shopee.vn" />
          </label>
          <p className="muted">{loading ? "Loading..." : `${videos.length} videos`}</p>
        </div>
      </section>

      <section className="admin-user-list" aria-label="Videos">
        {videos.length === 0 && !loading ? <div className="panel muted">No videos found.</div> : null}
        {videos.map((video) => (
          <article className="card admin-video-row" key={video.id}>
            <div className="admin-user-main">
              <strong>{video.job?.productSource?.title ?? video.publicSlug}</strong>
              <span className="badge">{video.job?.status ?? "video"}</span>
              <span className="muted">{video.user.email}</span>
            </div>
            <div className="admin-user-stats">
              <span>{video.width}x{video.height}</span>
              <span>{video.durationMs ? `${Math.round(video.durationMs / 1000)}s` : "No duration"}</span>
              <span>{video.scheduledPosts.length} scheduled</span>
            </div>
            <div className="admin-job-url">
              <span>{video.storageKey}</span>
              {video.job?.sourceUrl ? (
                <a href={video.job.sourceUrl} target="_blank" rel="noreferrer">
                  {video.job.sourceUrl}
                </a>
              ) : null}
            </div>
            <div className="admin-user-actions">
              <a className="button" href={`/samples/${video.publicSlug}`}>
                Preview
              </a>
              <a className="button" href={video.downloadUrl}>
                Download
              </a>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
