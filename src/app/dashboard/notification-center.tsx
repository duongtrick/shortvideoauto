"use client";

import { useEffect, useState, useTransition } from "react";

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  actionUrl: string | null;
  readAt: string | null;
  createdAt: string;
};

async function loadNotifications() {
  const response = await fetch("/api/notifications", { cache: "no-store" });
  if (!response.ok) throw new Error("Không tải được thông báo.");
  const data = (await response.json()) as { notifications: NotificationRow[] };
  return data.notifications;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    loadNotifications()
      .then((rows) => {
        if (active) setNotifications(rows.slice(0, 5));
      })
      .catch(() => {
        if (active) setMessage("Chưa tải được thông báo.");
      });

    return () => {
      active = false;
    };
  }, []);

  function markRead(id: string) {
    startTransition(async () => {
      const response = await fetch(`/api/notifications/${encodeURIComponent(id)}`, { method: "PATCH" });
      if (!response.ok) {
        setMessage("Không cập nhật được thông báo.");
        return;
      }
      setNotifications((current) =>
        current.map((item) => (item.id === id ? { ...item, readAt: new Date().toISOString() } : item))
      );
    });
  }

  return (
    <div className="panel status-list" aria-label="Thông báo gần đây">
      <div className="status-item">
        <strong>Thông báo</strong>
        <span className="badge">{notifications.filter((item) => !item.readAt).length} mới</span>
      </div>
      {notifications.length === 0 ? (
        <div className="status-item">
          <span>Chưa có thông báo</span>
          <span className="badge">empty</span>
        </div>
      ) : (
        notifications.map((notification) => (
          <div className="status-item" key={notification.id}>
            <div>
              <strong>
                {notification.actionUrl ? <a href={notification.actionUrl}>{notification.title}</a> : notification.title}
              </strong>
              <p className="muted">{notification.body}</p>
            </div>
            <button className="button" type="button" disabled={isPending || Boolean(notification.readAt)} onClick={() => markRead(notification.id)}>
              {notification.readAt ? "Đã đọc" : "Đánh dấu"}
            </button>
          </div>
        ))
      )}
      {message ? <p className="muted">{message}</p> : null}
    </div>
  );
}
