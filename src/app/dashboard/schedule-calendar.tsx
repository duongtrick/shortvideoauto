"use client";

import { useEffect, useMemo, useState } from "react";

type ScheduledPostRow = {
  id: string;
  platform: string;
  title: string | null;
  scheduledAt: string;
  status: string;
  hashtags: string[];
  manualChecklist?: { steps?: string[] } | null;
};

async function loadScheduledPosts() {
  const response = await fetch("/api/schedule?take=20", { cache: "no-store" });
  if (!response.ok) throw new Error("Khong tai duoc lich.");
  const data = (await response.json()) as { posts: ScheduledPostRow[] };
  return data.posts;
}

export function ScheduleCalendar() {
  const [posts, setPosts] = useState<ScheduledPostRow[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    loadScheduledPosts()
      .then((rows) => {
        if (active) setPosts(rows);
      })
      .catch(() => {
        if (active) setMessage("Chua tai duoc lich dang.");
      });

    return () => {
      active = false;
    };
  }, []);

  const grouped = useMemo(() => {
    return posts.reduce<Record<string, ScheduledPostRow[]>>((acc, post) => {
      const day = new Date(post.scheduledAt).toLocaleDateString("vi-VN");
      acc[day] = [...(acc[day] ?? []), post];
      return acc;
    }, {});
  }, [posts]);

  return (
    <div className="panel status-list" aria-label="Lich dang video">
      <div className="status-item">
        <strong>Lich dang</strong>
        <span className="badge">{posts.length} post</span>
      </div>
      {Object.keys(grouped).length === 0 ? (
        <div className="status-item">
          <span>Chua co lich dang</span>
          <span className="badge">empty</span>
        </div>
      ) : (
        Object.entries(grouped).map(([day, rows]) => (
          <div className="calendar-day" key={day}>
            <strong>{day}</strong>
            {rows.map((post) => (
              <div className="status-item" key={post.id}>
                <div>
                  <strong>{post.title ?? post.platform}</strong>
                <p className="muted">
                  {new Date(post.scheduledAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} -{" "}
                  {post.hashtags.slice(0, 3).join(" ")}
                </p>
                {post.manualChecklist?.steps?.length ? (
                  <p className="muted">{post.manualChecklist.steps.slice(0, 2).join(" / ")}</p>
                ) : null}
              </div>
                <span className="badge">{post.status}</span>
              </div>
            ))}
          </div>
        ))
      )}
      {message ? <p className="muted">{message}</p> : null}
    </div>
  );
}
