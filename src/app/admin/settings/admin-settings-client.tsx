"use client";

import { useToastState } from "@/app/toast-provider";
import { FormEvent, useEffect, useMemo, useState } from "react";

type SettingValue = string | number | boolean | Record<string, unknown>;

type SettingRow = {
  id: string;
  key: string;
  value: SettingValue;
  group: string;
  updatedAt: string;
};

type SettingsResponse = {
  settings: SettingRow[];
};

function parseSettingValue(rawValue: FormDataEntryValue | null): SettingValue {
  const raw = String(rawValue ?? "").trim();
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (raw && !Number.isNaN(Number(raw))) return Number(raw);
  if (raw.startsWith("{") && raw.endsWith("}")) return JSON.parse(raw) as Record<string, unknown>;
  return raw;
}

function formatSettingValue(value: SettingValue) {
  return typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
}

export function AdminSettingsClient() {
  const [settings, setSettings] = useState<SettingRow[]>([]);
  const [group, setGroup] = useState("");
  const [message, setMessage] = useToastState("");
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (group.trim()) params.set("group", group.trim());
    return params.toString();
  }, [group]);

  async function loadSettings() {
    setLoading(true);
    const response = await fetch(`/api/admin/settings${query ? `?${query}` : ""}`);
    const data = (await response.json()) as SettingsResponse;
    setSettings(data.settings ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadSettings();
  }, [query]);

  async function saveSetting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    let value: SettingValue;
    try {
      value = parseSettingValue(form.get("value"));
    } catch {
      return setMessage("Value JSON invalid.");
    }

    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        key: form.get("key"),
        value,
        group: form.get("group") || "general"
      })
    });
    setMessage(response.ok ? "Setting saved." : "Save setting failed.");
    if (response.ok) await loadSettings();
  }

  return (
    <div className="admin-users">
      <section className="panel admin-command">
        <form className="form compact-form" onSubmit={saveSetting}>
          <h2>Upsert setting</h2>
          <div className="admin-form-grid">
            <label>
              Key
              <input name="key" required minLength={2} placeholder="site_name" />
            </label>
            <label>
              Group
              <input name="group" defaultValue={group || "general"} required minLength={2} />
            </label>
            <label className="admin-wide">
              Value
              <textarea name="value" defaultValue="ShortVideoAuto" />
            </label>
          </div>
          <button className="button primary" type="submit">
            Save
          </button>
        </form>
        <div className="admin-toolbar">
          <label>
            Filter group
            <input value={group} onChange={(event) => setGroup(event.target.value)} placeholder="general" />
          </label>
          <p className="muted">{loading ? "Loading..." : `${settings.length} settings`}</p>
        </div>
        {message ? <p className="badge">{message}</p> : null}
      </section>

      <section className="admin-user-list" aria-label="Settings">
        {settings.length === 0 && !loading ? <div className="panel muted">No settings found.</div> : null}
        {settings.map((setting) => (
          <form className="card admin-template-row" key={setting.id} onSubmit={saveSetting}>
            <div className="admin-user-main">
              <strong>{setting.key}</strong>
              <span className="badge">{setting.group}</span>
            </div>
            <label>
              Group
              <input name="group" defaultValue={setting.group} required minLength={2} />
            </label>
            <label className="admin-template-config">
              Value
              <textarea name="value" defaultValue={formatSettingValue(setting.value)} />
            </label>
            <div className="admin-user-actions">
              <input name="key" type="hidden" value={setting.key} />
              <span className="muted">{new Date(setting.updatedAt).toLocaleString()}</span>
              <button className="button" type="submit">
                Save
              </button>
            </div>
          </form>
        ))}
      </section>
    </div>
  );
}
