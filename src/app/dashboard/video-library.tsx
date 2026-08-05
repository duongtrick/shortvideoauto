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

async function loadVideos() {
  const response = await fetch("/api/videos?status=completed&take=5", { cache: "no-store" });
  if (!response.ok) throw new Error("Khong tai duoc video.");
  const data = (await response.json()) as { videos: VideoRow[] };
  return data.videos;
}

export function VideoLibrary() {
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [message, setMessage] = useState("");
  const [scheduledVideoId, setScheduledVideoId] = useState("");

  useEffect(() => {
    let active = true;
    loadVideos()
      .then((rows) => {
        if (active) setVideos(rows);
      })
      .catch(() => {
        if (active) setMessage("Chua tai duoc thu vien video.");
      });

    return () => {
      active = false;
    };
  }, []);

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
