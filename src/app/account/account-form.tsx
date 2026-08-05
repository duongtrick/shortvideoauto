"use client";

import { signOut } from "next-auth/react";
import { useEffect, useState, useTransition } from "react";

type NotificationPreferences = {
  emailRenderDone: boolean;
  emailRenderFail: boolean;
  emailBilling: boolean;
  emailSecurity: boolean;
  digestMode: boolean;
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
};

type PaymentRow = {
  id: string;
  code: string;
  amount: number;
  credits: number;
  status: string;
};

type TransferInstruction = {
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  credits: number;
  content: string;
  qrPayload: string;
};

const defaultPreferences: NotificationPreferences = {
  emailRenderDone: true,
  emailRenderFail: true,
  emailBilling: true,
  emailSecurity: true,
  digestMode: false,
  quietHoursStart: null,
  quietHoursEnd: null
};

export function AccountForm({ email }: { email: string }) {
  const [message, setMessage] = useState("");
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [transfer, setTransfer] = useState<TransferInstruction | null>(null);
  const [preferencesMessage, setPreferencesMessage] = useState("");
  const [billingMessage, setBillingMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isSavingPreferences, startPreferencesTransition] = useTransition();
  const [isCreatingPayment, startPaymentTransition] = useTransition();

  useEffect(() => {
    let active = true;

    fetch("/api/notifications")
      .then((response) => response.json())
      .then((data: { preferences?: NotificationPreferences }) => {
        if (active && data.preferences) setPreferences(data.preferences);
      })
      .catch(() => {
        if (active) setPreferencesMessage("Chua tai duoc cau hinh thong bao.");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/billing/payments")
      .then((response) => response.json())
      .then((data: { payments?: PaymentRow[] }) => {
        if (active && data.payments) setPayments(data.payments);
      })
      .catch(() => {
        if (active) setBillingMessage("Chua tai duoc thanh toan.");
      });

    return () => {
      active = false;
    };
  }, []);

  function changePassword(formData: FormData) {
    setMessage("");
    startTransition(async () => {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          currentPassword: String(formData.get("currentPassword") ?? ""),
          newPassword: String(formData.get("newPassword") ?? "")
        })
      });
      const data = (await response.json()) as { error?: string };
      setMessage(response.ok ? "Da doi mat khau." : (data.error ?? "Khong doi duoc mat khau."));
    });
  }

  function updatePreference<K extends keyof NotificationPreferences>(key: K, value: NotificationPreferences[K]) {
    setPreferences((current) => ({ ...current, [key]: value }));
  }

  function savePreferences() {
    setPreferencesMessage("");
    startPreferencesTransition(async () => {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(preferences)
      });
      const data = (await response.json()) as { error?: string; preferences?: NotificationPreferences };
      if (data.preferences) setPreferences(data.preferences);
      setPreferencesMessage(response.ok ? "Da luu thong bao." : (data.error ?? "Khong luu duoc thong bao."));
    });
  }

  function createPayment(amount: number, credits: number) {
    setBillingMessage("");
    startPaymentTransition(async () => {
      const response = await fetch("/api/billing/payments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount, credits })
      });
      const data = (await response.json()) as { error?: string; payment?: PaymentRow; transfer?: TransferInstruction };
      if (!response.ok || !data.payment || !data.transfer) {
        setBillingMessage(data.error ?? "Khong tao duoc thanh toan.");
        return;
      }
      setPayments((current) => [data.payment as PaymentRow, ...current].slice(0, 20));
      setTransfer(data.transfer);
      setBillingMessage("Da tao lenh chuyen khoan.");
    });
  }

  return (
    <div className="account-stack">
      <div className="panel account-panel">
        <div>
          <h2>Tai khoan</h2>
          <p className="muted">{email}</p>
        </div>
        <form className="form" action={changePassword}>
          <label htmlFor="currentPassword">Mat khau hien tai</label>
          <input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
          <label htmlFor="newPassword">Mat khau moi</label>
          <input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required minLength={8} />
          <button className="button primary" type="submit" disabled={isPending}>
            {isPending ? "Dang luu" : "Doi mat khau"}
          </button>
        </form>
        <button className="button" type="button" onClick={() => signOut({ callbackUrl: "/login" })}>
          Dang xuat
        </button>
        {message ? <p className="muted">{message}</p> : null}
      </div>

      <div className="panel account-panel">
        <div>
          <h2>Thong bao</h2>
          <p className="muted">Cau hinh email va digest.</p>
        </div>
        <div className="toggle-list">
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={preferences.emailRenderDone}
              onChange={(event) => updatePreference("emailRenderDone", event.target.checked)}
            />
            <span>Video render xong</span>
          </label>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={preferences.emailRenderFail}
              onChange={(event) => updatePreference("emailRenderFail", event.target.checked)}
            />
            <span>Render loi hoac queue lau</span>
          </label>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={preferences.emailBilling}
              onChange={(event) => updatePreference("emailBilling", event.target.checked)}
            />
            <span>Thanh toan va credit</span>
          </label>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={preferences.emailSecurity}
              onChange={(event) => updatePreference("emailSecurity", event.target.checked)}
            />
            <span>Bao mat tai khoan</span>
          </label>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={preferences.digestMode}
              onChange={(event) => updatePreference("digestMode", event.target.checked)}
            />
            <span>Gom email thanh digest</span>
          </label>
        </div>
        <div className="input-row">
          <label htmlFor="quietHoursStart">Gio yen lang bat dau</label>
          <input
            id="quietHoursStart"
            type="number"
            inputMode="numeric"
            min={0}
            max={23}
            value={preferences.quietHoursStart ?? ""}
            onChange={(event) =>
              updatePreference("quietHoursStart", event.target.value === "" ? null : Number(event.target.value))
            }
          />
          <label htmlFor="quietHoursEnd">Gio yen lang ket thuc</label>
          <input
            id="quietHoursEnd"
            type="number"
            inputMode="numeric"
            min={0}
            max={23}
            value={preferences.quietHoursEnd ?? ""}
            onChange={(event) => updatePreference("quietHoursEnd", event.target.value === "" ? null : Number(event.target.value))}
          />
        </div>
        <button className="button primary" type="button" disabled={isSavingPreferences} onClick={savePreferences}>
          {isSavingPreferences ? "Dang luu" : "Luu thong bao"}
        </button>
        {preferencesMessage ? <p className="muted">{preferencesMessage}</p> : null}
      </div>

      <div className="panel account-panel">
        <div>
          <h2>Nap credit</h2>
          <p className="muted">Chuyen khoan dung noi dung de auto cong credit.</p>
        </div>
        <div className="billing-actions">
          <button className="button primary" type="button" disabled={isCreatingPayment} onClick={() => createPayment(100000, 100)}>
            100 credit
          </button>
          <button className="button" type="button" disabled={isCreatingPayment} onClick={() => createPayment(300000, 330)}>
            330 credit
          </button>
          <button className="button" type="button" disabled={isCreatingPayment} onClick={() => createPayment(500000, 600)}>
            600 credit
          </button>
        </div>
        {transfer ? (
          <div className="payment-box">
            <strong>{transfer.content}</strong>
            <p className="muted">
              {transfer.bankName || "BANK"} - {transfer.accountNumber || "ACCOUNT"} - {transfer.accountName || "ACCOUNT NAME"}
            </p>
            <p className="muted">{transfer.amount.toLocaleString("vi-VN")} VND</p>
            <code>{transfer.qrPayload}</code>
          </div>
        ) : null}
        <div className="status-list" aria-label="Thanh toan gan day">
          {payments.slice(0, 5).map((payment) => (
            <div className="status-item" key={payment.id}>
              <div>
                <strong>{payment.code}</strong>
                <p className="muted">{payment.amount.toLocaleString("vi-VN")} VND - {payment.credits} credit</p>
              </div>
              <span className="badge">{payment.status}</span>
            </div>
          ))}
        </div>
        {billingMessage ? <p className="muted">{billingMessage}</p> : null}
      </div>
    </div>
  );
}
