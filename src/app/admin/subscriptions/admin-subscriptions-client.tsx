"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type SubscriptionRow = {
  id: string;
  provider: string;
  providerId: string;
  status: string;
  currentPeriodEnd: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; email: string };
};

type SubscriptionsResponse = {
  subscriptions: SubscriptionRow[];
};

const statuses = ["active", "trialing", "past_due", "canceled"];

export function AdminSubscriptionsClient() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => {
    const params = new URLSearchParams({ take: "50" });
    if (q.trim()) params.set("q", q.trim());
    if (status) params.set("status", status);
    return params.toString();
  }, [q, status]);

  async function loadSubscriptions() {
    setLoading(true);
    const response = await fetch(`/api/admin/subscriptions?${query}`);
    const data = (await response.json()) as SubscriptionsResponse;
    setSubscriptions(data.subscriptions ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadSubscriptions();
  }, [query]);

  async function createSubscription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/subscriptions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userEmail: form.get("userEmail"),
        provider: form.get("provider"),
        providerId: form.get("providerId"),
        status: form.get("status"),
        currentPeriodEnd: form.get("currentPeriodEnd") ? new Date(String(form.get("currentPeriodEnd"))).toISOString() : undefined
      })
    });
    setMessage(response.ok ? "Subscription created." : "Create subscription failed.");
    if (response.ok) {
      event.currentTarget.reset();
      await loadSubscriptions();
    }
  }

  async function updateSubscription(event: FormEvent<HTMLFormElement>, item: SubscriptionRow) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/admin/subscriptions/${item.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        provider: form.get("provider"),
        status: form.get("status"),
        currentPeriodEnd: form.get("currentPeriodEnd") ? new Date(String(form.get("currentPeriodEnd"))).toISOString() : null
      })
    });
    setMessage(response.ok ? "Subscription updated." : "Update subscription failed.");
    await loadSubscriptions();
  }

  async function cancelSubscription(item: SubscriptionRow) {
    const response = await fetch(`/api/admin/subscriptions/${item.id}`, { method: "DELETE" });
    setMessage(response.ok ? "Subscription canceled." : "Cancel subscription failed.");
    await loadSubscriptions();
  }

  return (
    <div className="admin-users">
      <section className="panel admin-command">
        <form className="form compact-form" onSubmit={createSubscription}>
          <h2>Create subscription</h2>
          <div className="admin-form-grid">
            <label>
              User email
              <input name="userEmail" type="email" required />
            </label>
            <label>
              Provider
              <input name="provider" defaultValue="manual" required minLength={2} />
            </label>
            <label>
              Provider ID
              <input name="providerId" required minLength={2} />
            </label>
            <label>
              Status
              <select name="status" defaultValue="active">
                {statuses.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              Current period end
              <input name="currentPeriodEnd" type="datetime-local" />
            </label>
          </div>
          <button className="button primary" type="submit">Create</button>
        </form>
        <div className="admin-toolbar">
          <label>
            Search
            <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="email, provider, ID" />
          </label>
          <label>
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">all</option>
              {statuses.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <p className="muted">{loading ? "Loading..." : `${subscriptions.length} subscriptions`}</p>
        </div>
        {message ? <p className="badge">{message}</p> : null}
      </section>

      <section className="admin-user-list" aria-label="Subscriptions">
        {subscriptions.length === 0 && !loading ? <div className="panel muted">No subscriptions found.</div> : null}
        {subscriptions.map((item) => (
          <form className="card admin-payment-row" key={item.id} onSubmit={(event) => updateSubscription(event, item)}>
            <div className="admin-user-main">
              <strong>{item.user.email}</strong>
              <span className="badge">{item.status}</span>
              <span className="muted">{item.providerId}</span>
            </div>
            <div className="admin-user-actions">
              <input name="provider" defaultValue={item.provider} required minLength={2} />
              <select name="status" defaultValue={item.status}>
                {statuses.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <input
                name="currentPeriodEnd"
                type="datetime-local"
                defaultValue={item.currentPeriodEnd ? item.currentPeriodEnd.slice(0, 16) : ""}
              />
              <button className="button" type="submit">Save</button>
              <button className="button danger" type="button" onClick={() => cancelSubscription(item)}>Cancel</button>
            </div>
          </form>
        ))}
      </section>
    </div>
  );
}
