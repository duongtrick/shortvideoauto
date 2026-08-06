"use client";

import { useToastState } from "@/app/toast-provider";
import { FormEvent, useEffect, useState } from "react";

type ProviderRow = {
  id: string;
  key: string;
  name: string;
  config: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ProvidersResponse = {
  providers: ProviderRow[];
};

function parseConfig(value: FormDataEntryValue | null) {
  const raw = String(value ?? "{}").trim() || "{}";
  return JSON.parse(raw) as Record<string, unknown>;
}

export function AdminTtsClient() {
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [message, setMessage] = useToastState("");
  const [loading, setLoading] = useState(true);

  async function loadProviders() {
    setLoading(true);
    const response = await fetch("/api/admin/tts");
    const data = (await response.json()) as ProvidersResponse;
    setProviders(data.providers ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadProviders();
  }, []);

  async function createProvider(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    let config: Record<string, unknown>;
    try {
      config = parseConfig(form.get("config"));
    } catch {
      return setMessage("Config JSON invalid.");
    }

    const response = await fetch("/api/admin/tts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        key: form.get("key"),
        name: form.get("name"),
        config,
        isActive: form.get("isActive") === "on"
      })
    });
    setMessage(response.ok ? "TTS provider created." : "Create TTS provider failed.");
    if (response.ok) {
      event.currentTarget.reset();
      await loadProviders();
    }
  }

  async function updateProvider(event: FormEvent<HTMLFormElement>, provider: ProviderRow) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    let config: Record<string, unknown>;
    try {
      config = parseConfig(form.get("config"));
    } catch {
      return setMessage("Config JSON invalid.");
    }

    const response = await fetch(`/api/admin/tts/${provider.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        config,
        isActive: form.get("isActive") === "on"
      })
    });
    setMessage(response.ok ? "TTS provider updated." : "Update TTS provider failed.");
    await loadProviders();
  }

  async function testProvider(provider: ProviderRow) {
    const response = await fetch(`/api/admin/tts/${provider.id}/test`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "Xin chao, day la giong doc thu." })
    });
    const data = (await response.json().catch(() => ({}))) as { voice?: { storageKey?: string } };
    setMessage(response.ok ? `Test ready: ${data.voice?.storageKey ?? provider.key}` : "TTS test failed.");
  }

  async function disableProvider(provider: ProviderRow) {
    const response = await fetch(`/api/admin/tts/${provider.id}`, { method: "DELETE" });
    setMessage(response.ok ? "TTS provider disabled." : "Disable TTS provider failed.");
    await loadProviders();
  }

  return (
    <div className="admin-users">
      <section className="panel admin-command">
        <form className="form compact-form" onSubmit={createProvider}>
          <h2>Create TTS provider</h2>
          <div className="admin-form-grid">
            <label>
              Key
              <input name="key" required minLength={2} placeholder="fpt" />
            </label>
            <label>
              Name
              <input name="name" required minLength={2} placeholder="FPT.AI" />
            </label>
            <label className="admin-wide">
              Config JSON
              <textarea name="config" defaultValue={'{"voice":"banmai","priority":1}'} />
            </label>
            <label className="toggle-row">
              <input name="isActive" type="checkbox" defaultChecked />
              Active
            </label>
          </div>
          <button className="button primary" type="submit">
            Create
          </button>
        </form>
        {message ? <p className="badge">{message}</p> : null}
      </section>

      <section className="admin-user-list" aria-label="TTS providers">
        {providers.length === 0 && !loading ? <div className="panel muted">No TTS providers found.</div> : null}
        {providers.map((provider) => (
          <form className="card admin-template-row" key={provider.id} onSubmit={(event) => updateProvider(event, provider)}>
            <div className="admin-user-main">
              <strong>{provider.key}</strong>
              <span className="badge">{provider.isActive ? "active" : "inactive"}</span>
            </div>
            <label>
              Name
              <input name="name" defaultValue={provider.name} required minLength={2} />
            </label>
            <label className="admin-template-config">
              Config JSON
              <textarea name="config" defaultValue={JSON.stringify(provider.config, null, 2)} />
            </label>
            <div className="admin-user-actions">
              <label className="toggle-row">
                <input name="isActive" type="checkbox" defaultChecked={provider.isActive} />
                Active
              </label>
              <button className="button" type="button" onClick={() => testProvider(provider)}>
                Test
              </button>
              <button className="button" type="submit">
                Save
              </button>
              <button className="button danger" type="button" onClick={() => disableProvider(provider)}>
                Disable
              </button>
            </div>
          </form>
        ))}
      </section>
    </div>
  );
}
