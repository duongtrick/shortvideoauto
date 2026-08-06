"use client";

import { useEffect, useState } from "react";

type ReferralData = {
  referralLink: string;
  referral: { code: string; status: string; createdAt: string };
  commissions: Array<{ id: string; amount: number; status: string; createdAt: string }>;
};

export function ReferralPanel() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/referrals")
      .then((response) => response.json())
      .then((nextData: ReferralData) => {
        if (active) setData(nextData);
      })
      .catch(() => {
        if (active) setMessage("Chua tai duoc affiliate.");
      });
    return () => {
      active = false;
    };
  }, []);

  async function copyLink() {
    if (!data) return;
    await navigator.clipboard.writeText(data.referralLink);
    setMessage("Da copy link gioi thieu.");
  }

  const totalPending = data?.commissions
    .filter((commission) => commission.status === "pending")
    .reduce((total, commission) => total + commission.amount, 0) ?? 0;
  const totalPaid = data?.commissions
    .filter((commission) => commission.status === "paid")
    .reduce((total, commission) => total + commission.amount, 0) ?? 0;

  return (
    <div className="panel account-panel">
      <div>
        <h2>Affiliate SaaS</h2>
        <p className="muted">Chia se ShortVideoAuto va theo doi hoa hong.</p>
      </div>
      {data ? (
        <>
          <div className="payment-box">
            <strong>{data.referral.code}</strong>
            <code>{data.referralLink}</code>
          </div>
          <div className="billing-actions">
            <button className="button primary" type="button" onClick={copyLink}>
              Copy link
            </button>
            <span className="badge">Pending {totalPending.toLocaleString("vi-VN")} VND</span>
            <span className="badge">Paid {totalPaid.toLocaleString("vi-VN")} VND</span>
          </div>
          <div className="status-list" aria-label="Hoa hong gan day">
            {data.commissions.slice(0, 5).map((commission) => (
              <div className="status-item" key={commission.id}>
                <div>
                  <strong>{commission.amount.toLocaleString("vi-VN")} VND</strong>
                  <p className="muted">{new Date(commission.createdAt).toLocaleString()}</p>
                </div>
                <span className="badge">{commission.status}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="muted">Dang tai affiliate...</p>
      )}
      {message ? <p className="muted">{message}</p> : null}
    </div>
  );
}
