"use client";

import { useToastState } from "@/app/toast-provider";
import { FormEvent, useEffect, useState } from "react";

type JobSummary = {
  id: string;
  sourceUrl: string;
};

type JobDetail = {
  id: string;
  selectedScriptId: string | null;
  sourceUrl: string;
  productSource: { title: string | null; price: string | null; imageUrls: string[] } | null;
  scriptVariants: Array<{ id: string; angle: string; content: string; score: number }>;
};

async function loadLatestJob() {
  const listResponse = await fetch("/api/jobs", { cache: "no-store" });
  if (!listResponse.ok) throw new Error("No jobs.");
  const listData = (await listResponse.json()) as { jobs: JobSummary[] };
  const latest = listData.jobs[0];
  if (!latest) return null;
  const detailResponse = await fetch(`/api/jobs/${latest.id}`, { cache: "no-store" });
  if (!detailResponse.ok) throw new Error("No job detail.");
  const detailData = (await detailResponse.json()) as { job: JobDetail };
  return detailData.job;
}

export function JobPreviewPanel() {
  const [job, setJob] = useState<JobDetail | null>(null);
  const [message, setMessage] = useToastState("");

  useEffect(() => {
    let active = true;
    loadLatestJob()
      .then((nextJob) => {
        if (active) setJob(nextJob);
      })
      .catch(() => {
        if (active) setMessage("Chưa có preview job.");
      });
    return () => {
      active = false;
    };
  }, []);

  async function savePreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!job) return;
    const form = new FormData(event.currentTarget);
    const selectedScriptId = String(form.get("selectedScriptId") ?? "");
    const response = await fetch(`/api/jobs/${job.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        productTitle: form.get("productTitle"),
        price: form.get("price"),
        selectedScriptId,
        scriptContent: form.get("scriptContent"),
        cta: form.get("cta"),
        voice: form.get("voice"),
        musicTrack: form.get("musicTrack"),
        musicVolume: Number(form.get("musicVolume") ?? 0.35),
        captionPreset: form.get("captionPreset")
      })
    });
    const data = (await response.json().catch(() => ({}))) as { job?: JobDetail };
    if (data.job) setJob(data.job);
    setMessage(response.ok ? "Đã lưu preview." : "Không lưu được preview.");
  }

  const selectedScript = job?.scriptVariants.find((script) => script.id === (job.selectedScriptId ?? job.scriptVariants[0]?.id));

  return (
    <section className="panel preview-workspace" aria-label="Preview trước render">
      <div>
        <h2>Preview trước render</h2>
        <p className="muted">{job?.sourceUrl ?? "Chọn job mới nhất để sửa script và xem khung 9:16."}</p>
      </div>
      {job ? (
        <div className="preview-split">
          <form className="form compact-form" onSubmit={savePreview}>
            <label>
              Tên sản phẩm
              <input name="productTitle" defaultValue={job.productSource?.title ?? ""} required />
            </label>
            <label>
              Giá
              <input name="price" defaultValue={job.productSource?.price ?? ""} />
            </label>
            <label>
              Script
              <select name="selectedScriptId" defaultValue={selectedScript?.id}>
                {job.scriptVariants.map((script) => (
                  <option key={script.id} value={script.id}>{script.angle}</option>
                ))}
              </select>
            </label>
            <textarea name="scriptContent" defaultValue={selectedScript?.content ?? "Review nhanh sản phẩm này trong 30 giây."} />
            <div className="input-row">
              <input name="cta" placeholder="CTA" defaultValue="Bấm xem deal" />
              <input name="voice" placeholder="voice" defaultValue="banmai" />
            </div>
            <div className="input-row">
              <input name="musicTrack" placeholder="music" defaultValue="summer_deal" />
              <input name="musicVolume" type="number" step="0.05" min="0" max="1" defaultValue="0.35" />
            </div>
            <select name="captionPreset" defaultValue="deal_pop">
              <option value="clean_bold">clean_bold</option>
              <option value="deal_pop">deal_pop</option>
              <option value="story_subtle">story_subtle</option>
              <option value="karaoke_highlight">karaoke_highlight</option>
            </select>
            <button className="button primary" type="submit">Lưu preview</button>
          </form>
          <div className="preview panel">
            <div className="video-frame">{job.productSource?.title ?? "Video preview"}</div>
            <div>
              <p className="price">{job.productSource?.price ?? "Giá deal"}</p>
              <p className="muted">{selectedScript?.angle ?? "review nhanh"}</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="muted">Tạo job trước để có preview.</p>
      )}
      {message ? <p className="muted">{message}</p> : null}
    </section>
  );
}
