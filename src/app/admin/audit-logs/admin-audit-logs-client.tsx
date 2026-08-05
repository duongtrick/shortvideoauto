"use client";

import { useEffect, useMemo, useState } from "react";

type AuditLogRow = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  meta: Record<string, unknown> | null;
  createdAt: string;
  user: { id: string; email: string; role: string } | null;
};

type AuditLogsResponse = {
  logs: AuditLogRow[];
};

export function AdminAuditLogsClient() {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [action, setAction] = useState("");
  const [entity, setEntity] = useState("");
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => {
    const params = new URLSearchParams({ take: "80" });
    if (action.trim()) params.set("action", action.trim());
    if (entity.trim()) params.set("entity", entity.trim());
    return params.toString();
  }, [action, entity]);

  async function loadLogs() {
    setLoading(true);
    const response = await fetch(`/api/admin/audit-logs?${query}`);
    const data = (await response.json()) as AuditLogsResponse;
    setLogs(data.logs ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadLogs();
  }, [query]);

  return (
    <div className="admin-users">
      <section className="panel admin-command">
        <div className="admin-toolbar">
          <label>
            Action
            <input value={action} onChange={(event) => setAction(event.target.value)} placeholder="payment.refund" />
          </label>
          <label>
            Entity
            <input value={entity} onChange={(event) => setEntity(event.target.value)} placeholder="Payment" />
          </label>
          <p className="muted">{loading ? "Loading..." : `${logs.length} logs`}</p>
        </div>
      </section>

      <section className="admin-user-list" aria-label="Audit logs">
        {logs.length === 0 && !loading ? <div className="panel muted">No audit logs found.</div> : null}
        {logs.map((log) => (
          <article className="card admin-audit-row" key={log.id}>
            <div className="admin-user-main">
              <strong>{log.action}</strong>
              <span className="badge">{log.entity}</span>
              <span className="muted">{log.user?.email ?? "system"}</span>
            </div>
            <div className="admin-user-stats">
              <span>{log.entityId ?? "No entity ID"}</span>
              <span>{new Date(log.createdAt).toLocaleString()}</span>
            </div>
            <pre className="admin-code">{JSON.stringify(log.meta ?? {}, null, 2)}</pre>
          </article>
        ))}
      </section>
    </div>
  );
}
