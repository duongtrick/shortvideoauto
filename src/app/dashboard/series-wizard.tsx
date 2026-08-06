"use client";

import { useEffect, useState, useTransition } from "react";

type SeriesRow = {
  id: string;
  name: string;
  niche: string;
  cadence: string;
  platformTargets: string[];
  templateKey: string | null;
  voice: string | null;
  isActive: boolean;
};

async function loadSeries() {
  const response = await fetch("/api/series", { cache: "no-store" });
  if (!response.ok) throw new Error("Không tải được series.");
  const data = (await response.json()) as { series: SeriesRow[] };
  return data.series;
}

export function SeriesWizard() {
  const [series, setSeries] = useState<SeriesRow[]>([]);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    loadSeries()
      .then((rows) => {
        if (active) setSeries(rows);
      })
      .catch(() => {
        if (active) setMessage("Chưa tải được series.");
      });

    return () => {
      active = false;
    };
  }, []);

  function createSeries(formData: FormData) {
    setMessage("");
    startTransition(async () => {
      const response = await fetch("/api/series", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: String(formData.get("name") ?? ""),
          niche: String(formData.get("niche") ?? ""),
          cadence: String(formData.get("cadence") ?? "daily"),
          platformTargets: ["tiktok"],
          templateKey: String(formData.get("templateKey") ?? "") || undefined,
          voice: String(formData.get("voice") ?? "") || undefined,
          defaultCta: String(formData.get("defaultCta") ?? "") || undefined
        })
      });
      const data = (await response.json()) as { error?: string; series?: SeriesRow };
      if (!response.ok || !data.series) {
        setMessage(data.error ?? "Không tạo được series.");
        return;
      }
      setSeries((current) => [data.series as SeriesRow, ...current]);
      setMessage("Đã tạo series.");
    });
  }

  function toggleSeries(item: SeriesRow) {
    startTransition(async () => {
      const response = await fetch(`/api/series/${encodeURIComponent(item.id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive })
      });
      const data = (await response.json()) as { series?: SeriesRow };
      if (data.series) {
        setSeries((current) => current.map((row) => (row.id === item.id ? (data.series as SeriesRow) : row)));
      }
    });
  }

  return (
    <div className="panel status-list" aria-label="Series nội dung">
      <div className="status-item">
        <strong>Series</strong>
        <span className="badge">{series.length} series</span>
      </div>
      <form className="form compact-form" action={createSeries}>
        <input name="name" placeholder="Tên series" required />
        <input name="niche" placeholder="Niche: gia dụng, mẹ và bé..." required />
        <select name="cadence" defaultValue="daily">
          <option value="three_per_week">3 video/tuần</option>
          <option value="daily">Hằng ngày</option>
          <option value="twice_daily">2 video/ngày</option>
        </select>
        <input name="templateKey" placeholder="Template key" />
        <input name="voice" placeholder="Voice: banmai" />
        <input name="defaultCta" placeholder="CTA mặc định" />
        <button className="button primary" type="submit" disabled={isPending}>
          {isPending ? "Đang tạo" : "Tạo series"}
        </button>
      </form>
      {series.slice(0, 5).map((item) => (
        <div className="status-item" key={item.id}>
          <div>
            <strong>{item.name}</strong>
            <p className="muted">
              {item.niche} - {item.cadence} - {item.platformTargets.join(", ")}
            </p>
          </div>
          <span className="badge">{item.templateKey ?? item.voice ?? "default"}</span>
          <button className="button" type="button" onClick={() => toggleSeries(item)}>
            {item.isActive ? "Pause" : "Resume"}
          </button>
        </div>
      ))}
      {message ? <p className="muted">{message}</p> : null}
    </div>
  );
}
