"use client";

import { useToastState } from "@/app/toast-provider";
import { useEffect, useState } from "react";

type ReferralData = {
  referralLink: string;
  referral: { code: string; status: string; createdAt: string };
  commissions: Array<{ id: string; amount: number; status: string; createdAt: string }>;
};

export function ReferralPanel() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [message, setMessage] = useToastState("");

  useEffect(() => {
    let active = true;
    fetch("/api/referrals")
      .then((response) => response.json())
      .then((nextData: ReferralData) => {
        if (active) setData(nextData);
      })
      .catch(() => {
        if (active) setMessage("Chưa tải được affiliate.");
      });
    return () => {
      active = false;
    };
  }, []);

  async function copyLink() {
    if (!data) return;
    await navigator.clipboard.writeText(data.referralLink);
    setMessage("Đã copy link giới thiệu.");
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
        <p className="muted">Chia sẻ ShortVideoAuto và theo dõi hoa hồng.</p>
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
            <span className="badge">Chờ duyệt {totalPending.toLocaleString("vi-VN")} VND</span>
            <span className="badge">Đã trả {totalPaid.toLocaleString("vi-VN")} VND</span>
          </div>
          <div className="status-list" aria-label="Hoa hồng gần đây">
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
        <p className="muted">Đang tải affiliate...</p>
      )}
      {message ? <p className="muted">{message}</p> : null}
    </div>
  );
}
