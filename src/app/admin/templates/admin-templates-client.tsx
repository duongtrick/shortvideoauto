"use client";

import { useToastState } from "@/app/toast-provider";
import { FormEvent, useEffect, useState } from "react";

type TemplateRow = {
  id: string;
  key: string;
  name: string;
  config: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type TemplatesResponse = {
  templates: TemplateRow[];
};

function parseConfig(value: FormDataEntryValue | null) {
  const raw = String(value ?? "{}").trim() || "{}";
  return JSON.parse(raw) as Record<string, unknown>;
}

export function AdminTemplatesClient() {
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [message, setMessage] = useToastState("");
  const [loading, setLoading] = useState(true);

  async function loadTemplates() {
    setLoading(true);
    const response = await fetch("/api/admin/templates");
    const data = (await response.json()) as TemplatesResponse;
    setTemplates(data.templates ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadTemplates();
  }, []);

  async function createTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let config: Record<string, unknown>;
    try {
      config = parseConfig(new FormData(event.currentTarget).get("config"));
    } catch {
      return setMessage("Config JSON invalid.");
    }
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/templates", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        key: form.get("key"),
        name: form.get("name"),
        config,
        isActive: form.get("isActive") === "on"
      })
    });
    setMessage(response.ok ? "Template created." : "Create template failed.");
    if (response.ok) {
      event.currentTarget.reset();
      await loadTemplates();
    }
  }

  async function updateTemplate(event: FormEvent<HTMLFormElement>, template: TemplateRow) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    let config: Record<string, unknown>;
    try {
      config = parseConfig(form.get("config"));
    } catch {
      return setMessage("Config JSON invalid.");
    }
    const response = await fetch(`/api/admin/templates/${template.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        config,
        isActive: form.get("isActive") === "on"
      })
    });
    setMessage(response.ok ? "Template updated." : "Update template failed.");
    await loadTemplates();
  }

  async function disableTemplate(template: TemplateRow) {
    const response = await fetch(`/api/admin/templates/${template.id}`, { method: "DELETE" });
    setMessage(response.ok ? "Template disabled." : "Disable template failed.");
    await loadTemplates();
  }

  return (
    <div className="admin-users">
      <section className="panel admin-command">
        <form className="form compact-form" onSubmit={createTemplate}>
          <h2>Create template</h2>
          <div className="admin-form-grid">
            <label>
              Key
              <input name="key" required minLength={2} placeholder="deal_pop" />
            </label>
            <label>
              Name
              <input name="name" required minLength={2} placeholder="Deal Pop" />
            </label>
            <label className="admin-wide">
              Config JSON
              <textarea name="config" defaultValue={'{"compositionId":"ProductShort","accent":"#0f766e"}'} />
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

      <section className="admin-user-list" aria-label="Templates">
        {templates.length === 0 && !loading ? <div className="panel muted">No templates found.</div> : null}
        {templates.map((template) => (
          <form className="card admin-template-row" key={template.id} onSubmit={(event) => updateTemplate(event, template)}>
            <div className="admin-user-main">
              <strong>{template.key}</strong>
              <span className="badge">{template.isActive ? "active" : "inactive"}</span>
            </div>
            <label>
              Name
              <input name="name" defaultValue={template.name} required minLength={2} />
            </label>
            <label className="admin-template-config">
              Config JSON
              <textarea name="config" defaultValue={JSON.stringify(template.config, null, 2)} />
            </label>
            <div className="admin-user-actions">
              <label className="toggle-row">
                <input name="isActive" type="checkbox" defaultChecked={template.isActive} />
                Active
              </label>
              <button className="button" type="submit">
                Save
              </button>
              <button className="button danger" type="button" onClick={() => disableTemplate(template)}>
                Disable
              </button>
            </div>
          </form>
        ))}
      </section>
    </div>
  );
}
