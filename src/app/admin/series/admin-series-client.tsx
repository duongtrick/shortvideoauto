"use client";

import { useToastState } from "@/app/toast-provider";
import { FormEvent, useEffect, useMemo, useState } from "react";

type SeriesRow = {
  id: string;
  name: string;
  niche: string;
  cadence: "three_per_week" | "daily" | "twice_daily";
  language: string;
  platformTargets: string[];
  templateKey: string | null;
  voice: string | null;
  defaultCta: string | null;
  isActive: boolean;
  createdAt: string;
  user: { id: string; email: string };
  _count: { jobs: number };
};

type SeriesResponse = {
  series: SeriesRow[];
};

const cadences = ["three_per_week", "daily", "twice_daily"];

export function AdminSeriesClient() {
  const [series, setSeries] = useState<SeriesRow[]>([]);
  const [q, setQ] = useState("");
  const [isActive, setIsActive] = useState("");
  const [message, setMessage] = useToastState("");
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => {
    const params = new URLSearchParams({ take: "50" });
    if (q.trim()) params.set("q", q.trim());
    if (isActive) params.set("isActive", isActive);
    return params.toString();
  }, [q, isActive]);

  async function loadSeries() {
    setLoading(true);
    const response = await fetch(`/api/admin/series?${query}`);
    const data = (await response.json()) as SeriesResponse;
    setSeries(data.series ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadSeries();
  }, [query]);

  async function createSeries(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/series", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userEmail: form.get("userEmail"),
        name: form.get("name"),
        niche: form.get("niche"),
        cadence: form.get("cadence"),
        language: form.get("language") || "vi-VN",
        platformTargets: String(form.get("platformTargets") ?? "tiktok").split(",").map((item) => item.trim()).filter(Boolean),
        templateKey: form.get("templateKey") || undefined,
        voice: form.get("voice") || undefined,
        defaultCta: form.get("defaultCta") || undefined
      })
    });
    setMessage(response.ok ? "Series created." : "Create series failed.");
    if (response.ok) {
      event.currentTarget.reset();
      await loadSeries();
    }
  }

  async function updateSeries(event: FormEvent<HTMLFormElement>, item: SeriesRow) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/admin/series/${item.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        niche: form.get("niche"),
        cadence: form.get("cadence"),
        language: form.get("language"),
        platformTargets: String(form.get("platformTargets") ?? "tiktok").split(",").map((target) => target.trim()).filter(Boolean),
        templateKey: form.get("templateKey") || undefined,
        voice: form.get("voice") || undefined,
        defaultCta: form.get("defaultCta") || undefined,
        isActive: form.get("isActive") === "on"
      })
    });
    setMessage(response.ok ? "Series updated." : "Update series failed.");
    await loadSeries();
  }

  return (
    <div className="admin-users">
      <section className="panel admin-command">
        <form className="form compact-form" onSubmit={createSeries}>
          <h2>Create series</h2>
          <div className="admin-form-grid">
            <label>
              User email
              <input name="userEmail" type="email" required />
            </label>
            <label>
              Name
              <input name="name" required minLength={2} />
            </label>
            <label>
              Niche
              <input name="niche" required minLength={2} />
            </label>
            <label>
              Cadence
              <select name="cadence" defaultValue="daily">
                {cadences.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              Language
              <input name="language" defaultValue="vi-VN" />
            </label>
            <label>
              Platforms
              <input name="platformTargets" defaultValue="tiktok" />
            </label>
          </div>
          <button className="button primary" type="submit">Create</button>
        </form>
        <div className="admin-toolbar">
          <label>
            Search
            <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="name, niche, email" />
          </label>
          <label>
            Active
            <select value={isActive} onChange={(event) => setIsActive(event.target.value)}>
              <option value="">all</option>
              <option value="true">active</option>
              <option value="false">paused</option>
            </select>
          </label>
          <p className="muted">{loading ? "Loading..." : `${series.length} series`}</p>
        </div>
        {message ? <p className="badge">{message}</p> : null}
      </section>

      <section className="admin-user-list" aria-label="Series">
        {series.length === 0 && !loading ? <div className="panel muted">No series found.</div> : null}
        {series.map((item) => (
          <form className="card admin-template-row" key={item.id} onSubmit={(event) => updateSeries(event, item)}>
            <div className="admin-user-main">
              <strong>{item.user.email}</strong>
              <span className="badge">{item.isActive ? "active" : "paused"}</span>
              <span className="muted">{item._count.jobs} jobs</span>
            </div>
            <label>
              Name
              <input name="name" defaultValue={item.name} required minLength={2} />
            </label>
            <label>
              Niche
              <input name="niche" defaultValue={item.niche} required minLength={2} />
            </label>
            <div className="admin-user-actions">
              <select name="cadence" defaultValue={item.cadence}>
                {cadences.map((cadence) => (
                  <option key={cadence} value={cadence}>{cadence}</option>
                ))}
              </select>
              <input name="language" defaultValue={item.language} />
              <input name="platformTargets" defaultValue={item.platformTargets.join(",")} />
              <label className="toggle-row">
                <input name="isActive" type="checkbox" defaultChecked={item.isActive} />
                Active
              </label>
              <button className="button" type="submit">Save</button>
            </div>
          </form>
        ))}
      </section>
    </div>
  );
}
