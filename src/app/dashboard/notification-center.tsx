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
  if (!response.ok) throw new Error("Khong tai duoc thong bao.");
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
        if (active) setMessage("Chua tai duoc thong bao.");
      });

    return () => {
      active = false;
    };
  }, []);

  function markRead(id: string) {
    startTransition(async () => {
      const response = await fetch(`/api/notifications/${encodeURIComponent(id)}`, { method: "PATCH" });
      if (!response.ok) {
        setMessage("Khong cap nhat duoc thong bao.");
        return;
      }
      setNotifications((current) =>
        current.map((item) => (item.id === id ? { ...item, readAt: new Date().toISOString() } : item))
      );
    });
  }

  return (
    <div className="panel status-list" aria-label="Thong bao gan day">
      <div className="status-item">
        <strong>Thong bao</strong>
        <span className="badge">{notifications.filter((item) => !item.readAt).length} moi</span>
      </div>
      {notifications.length === 0 ? (
        <div className="status-item">
          <span>Chua co thong bao</span>
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
              {notification.readAt ? "Da doc" : "Danh dau"}
            </button>
          </div>
        ))
      )}
      {message ? <p className="muted">{message}</p> : null}
    </div>
  );
}
