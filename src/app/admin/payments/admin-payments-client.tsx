"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type PaymentRow = {
  id: string;
  code: string;
  amount: number;
  credits: number;
  status: "pending" | "paid" | "refunded" | string;
  bankTxnId: string | null;
  matchedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; email: string };
};

type PaymentsResponse = {
  payments: PaymentRow[];
};

const statuses = ["pending", "paid", "refunded"];

export function AdminPaymentsClient() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => {
    const params = new URLSearchParams({ take: "50" });
    if (status) params.set("status", status);
    return params.toString();
  }, [status]);

  async function loadPayments() {
    setLoading(true);
    const response = await fetch(`/api/admin/payments?${query}`);
    const data = (await response.json()) as PaymentsResponse;
    setPayments(data.payments ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadPayments();
  }, [query]);

  async function confirmPayment(event: FormEvent<HTMLFormElement>, payment: PaymentRow) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const bankTxnId = String(form.get("bankTxnId") ?? "").trim();
    if (!bankTxnId) return setMessage("Bank transaction ID required.");
    const response = await fetch(`/api/admin/payments/${payment.id}/confirm`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bankTxnId })
    });
    setMessage(response.ok ? "Payment confirmed." : "Confirm failed.");
    if (response.ok) event.currentTarget.reset();
    await loadPayments();
  }

  async function refundPayment(payment: PaymentRow) {
    if (!confirm(`Refund ${payment.code}?`)) return;
    const response = await fetch(`/api/admin/payments/${payment.id}/refund`, { method: "POST" });
    setMessage(response.ok ? "Payment refunded." : "Refund failed.");
    await loadPayments();
  }

  return (
    <div className="admin-users">
      <section className="panel admin-command">
        <div className="admin-toolbar">
          <label>
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">all</option>
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <a className="button" href={`/api/admin/payments/export?${query}`}>
            Export CSV
          </a>
          <p className="muted">{loading ? "Loading..." : `${payments.length} payments`}</p>
        </div>
        {message ? <p className="badge">{message}</p> : null}
      </section>

      <section className="admin-user-list" aria-label="Payments">
        {payments.length === 0 && !loading ? <div className="panel muted">No payments found.</div> : null}
        {payments.map((payment) => (
          <article className="card admin-payment-row" key={payment.id}>
            <div className="admin-user-main">
              <strong>{payment.code}</strong>
              <span className="badge">{payment.status}</span>
              <span className="muted">{payment.user.email}</span>
            </div>
            <div className="admin-user-stats">
              <span>{payment.amount.toLocaleString("vi-VN")} VND</span>
              <span>{payment.credits} credits</span>
              <span>{payment.bankTxnId ?? "No bank txn"}</span>
            </div>
            <form className="admin-user-actions" onSubmit={(event) => confirmPayment(event, payment)}>
              <input
                name="bankTxnId"
                aria-label={`Bank transaction ID for ${payment.code}`}
                placeholder="bank transaction ID"
                disabled={payment.status === "paid" || payment.status === "refunded"}
              />
              <button className="button" type="submit" disabled={payment.status === "paid" || payment.status === "refunded"}>
                Confirm
              </button>
              <button className="button danger" type="button" disabled={payment.status === "refunded"} onClick={() => refundPayment(payment)}>
                Refund
              </button>
            </form>
          </article>
        ))}
      </section>
    </div>
  );
}
