"use client";

import { useEffect, useState } from "react";

type VideoRow = {
  id: string;
  downloadUrl: string;
  createdAt: string;
  job?: {
    productSource?: { title: string | null; price: string | null } | null;
    status?: string;
  } | null;
};

type VideoFilters = {
  status: string;
  sourceHost: string;
  templateKey: string;
  language: string;
  dateFrom: string;
  dateTo: string;
};

const defaultFilters: VideoFilters = {
  status: "completed",
  sourceHost: "",
  templateKey: "",
  language: "",
  dateFrom: "",
  dateTo: ""
};

async function loadVideos(filters: VideoFilters) {
  const params = new URLSearchParams({ take: "20" });
  if (filters.status) params.set("status", filters.status);
  if (filters.sourceHost) params.set("sourceHost", filters.sourceHost);
  if (filters.templateKey) params.set("templateKey", filters.templateKey);
  if (filters.language) params.set("language", filters.language);
  if (filters.dateFrom) params.set("dateFrom", new Date(filters.dateFrom).toISOString());
  if (filters.dateTo) params.set("dateTo", new Date(filters.dateTo).toISOString());

  const response = await fetch(`/api/videos?${params}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Khong tai duoc video.");
  const data = (await response.json()) as { videos: VideoRow[] };
  return data.videos;
}

export function VideoLibrary() {
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [message, setMessage] = useState("");
  const [scheduledVideoId, setScheduledVideoId] = useState("");
  const [filters, setFilters] = useState<VideoFilters>(defaultFilters);

  useEffect(() => {
    let active = true;
    loadVideos(filters)
      .then((rows) => {
        if (active) setVideos(rows);
      })
      .catch(() => {
        if (active) setMessage("Chua tai duoc thu vien video.");
      });

    return () => {
      active = false;
    };
  }, [filters]);

  function updateFilter<K extends keyof VideoFilters>(key: K, value: VideoFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  async function scheduleVideo(video: VideoRow) {
    setMessage("");
    const bestTimeResponse = await fetch("/api/schedule/best-times", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ platform: "tiktok", daysAhead: 2 })
    });
    const suggestionResponse = await fetch("/api/schedule/suggestions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ videoId: video.id, platform: "tiktok", tone: "deal" })
    });
    const bestTimeData = (await bestTimeResponse.json()) as { recommendations?: { scheduledAt: string }[] };
    const suggestionData = (await suggestionResponse.json()) as {
      suggestion?: { title: string; caption: string; hashtags: string[] };
    };
    const response = await fetch("/api/schedule", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        videoId: video.id,
        platform: "tiktok",
        title: suggestionData.suggestion?.title ?? video.job?.productSource?.title ?? "Video affiliate",
        caption: suggestionData.suggestion?.caption,
        hashtags: suggestionData.suggestion?.hashtags ?? ["#dealhot"],
        scheduledAt: bestTimeData.recommendations?.[0]?.scheduledAt ?? new Date(Date.now() + 86_400_000).toISOString()
      })
    });
    setScheduledVideoId(response.ok ? video.id : "");
    setMessage(response.ok ? "Da len lich TikTok draft." : "Khong len lich duoc.");
  }

  return (
    <div className="panel status-list" aria-label="Thu vien video">
      <div className="status-item">
        <strong>Thu vien video</strong>
        <span className="badge">{videos.length} video</span>
      </div>
      <div className="library-filters" aria-label="Bo loc video">
        <label>
          Status
          <select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
            <option value="">all</option>
            <option value="completed">completed</option>
            <option value="failed">failed</option>
            <option value="queued">queued</option>
            <option value="rendering">rendering</option>
          </select>
        </label>
        <label>
          Source
          <input value={filters.sourceHost} onChange={(event) => updateFilter("sourceHost", event.target.value)} placeholder="shopee.vn" />
        </label>
        <label>
          Template
          <input value={filters.templateKey} onChange={(event) => updateFilter("templateKey", event.target.value)} placeholder="clean_minimal" />
        </label>
        <label>
          Language
          <input value={filters.language} onChange={(event) => updateFilter("language", event.target.value)} placeholder="vi-VN" />
        </label>
        <label>
          From
          <input value={filters.dateFrom} onChange={(event) => updateFilter("dateFrom", event.target.value)} type="date" />
        </label>
        <label>
          To
          <input value={filters.dateTo} onChange={(event) => updateFilter("dateTo", event.target.value)} type="date" />
        </label>
      </div>
      {videos.length === 0 ? (
        <div className="status-item">
          <span>Chua co video hoan tat</span>
          <span className="badge">empty</span>
        </div>
      ) : (
        videos.map((video) => (
          <div className="status-item" key={video.id}>
            <div>
              <strong>{video.job?.productSource?.title ?? video.id}</strong>
              <p className="muted">{video.job?.productSource?.price ?? new Date(video.createdAt).toLocaleDateString("vi-VN")}</p>
            </div>
            <a className="button" href={video.downloadUrl}>
              Tai MP4
            </a>
            <button className="button" type="button" onClick={() => scheduleVideo(video)}>
              {scheduledVideoId === video.id ? "Da len lich" : "Len lich"}
            </button>
          </div>
        ))
      )}
      {message ? <p className="muted">{message}</p> : null}
    </div>
  );
}
