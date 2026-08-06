"use client";

import { useToastState } from "@/app/toast-provider";
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

type CreditPack = {
  key: string;
  name: string;
  amount: number;
  credits: number;
  description: string;
};

type SubscriptionPlan = {
  key: string;
  name: string;
  price: number;
  durationDays: number;
  credits: number;
  description: string;
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
  const [message, setMessage] = useToastState("");
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [creditPacks, setCreditPacks] = useState<CreditPack[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [transfer, setTransfer] = useState<TransferInstruction | null>(null);
  const [preferencesMessage, setPreferencesMessage] = useToastState("");
  const [billingMessage, setBillingMessage] = useToastState("");
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
        if (active) setPreferencesMessage("Chưa tải được cấu hình thông báo.");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/pricing")
      .then((response) => response.json())
      .then((data: { creditPacks?: CreditPack[]; subscriptionPlans?: SubscriptionPlan[] }) => {
        if (active) setCreditPacks(data.creditPacks ?? []);
        if (active) setSubscriptionPlans(data.subscriptionPlans ?? []);
      })
      .catch(() => {
        if (active) setCreditPacks([]);
        if (active) setSubscriptionPlans([]);
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
        if (active) setBillingMessage("Chưa tải được thanh toán.");
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
      setMessage(response.ok ? "Đã đổi mật khẩu." : (data.error ?? "Không đổi được mật khẩu."));
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
      setPreferencesMessage(response.ok ? "Đã lưu thông báo." : (data.error ?? "Không lưu được thông báo."));
    });
  }

  function createPayment(input: { amount: number; credits: number } | { planKey: string }) {
    setBillingMessage("");
    startPaymentTransition(async () => {
      const response = await fetch("/api/billing/payments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input)
      });
      const data = (await response.json()) as { error?: string; payment?: PaymentRow; transfer?: TransferInstruction };
      if (!response.ok || !data.payment || !data.transfer) {
        setBillingMessage(data.error ?? "Không tạo được thanh toán.");
        return;
      }
      setPayments((current) => [data.payment as PaymentRow, ...current].slice(0, 20));
      setTransfer(data.transfer);
      setBillingMessage("Đã tạo lệnh chuyển khoản.");
    });
  }

  return (
    <div className="account-stack">
      <div className="panel account-panel">
        <div>
          <h2>Tài khoản</h2>
          <p className="muted">{email}</p>
        </div>
        <form className="form" action={changePassword}>
          <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
          <input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
          <label htmlFor="newPassword">Mật khẩu mới</label>
          <input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required minLength={8} />
          <button className="button primary" type="submit" disabled={isPending}>
            {isPending ? "Đang lưu" : "Đổi mật khẩu"}
          </button>
        </form>
        <button className="button" type="button" onClick={() => signOut({ callbackUrl: "/login" })}>
          Đăng xuất
        </button>
        {message ? <p className="muted">{message}</p> : null}
      </div>

      <div className="panel account-panel">
        <div>
          <h2>Thông báo</h2>
          <p className="muted">Cấu hình email và digest.</p>
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
            <span>Render lỗi hoặc queue lâu</span>
          </label>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={preferences.emailBilling}
              onChange={(event) => updatePreference("emailBilling", event.target.checked)}
            />
            <span>Thanh toán và credit</span>
          </label>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={preferences.emailSecurity}
              onChange={(event) => updatePreference("emailSecurity", event.target.checked)}
            />
            <span>Bảo mật tài khoản</span>
          </label>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={preferences.digestMode}
              onChange={(event) => updatePreference("digestMode", event.target.checked)}
            />
            <span>Gom email thành digest</span>
          </label>
        </div>
        <div className="input-row">
          <label htmlFor="quietHoursStart">Giờ yên lặng bắt đầu</label>
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
          <label htmlFor="quietHoursEnd">Giờ yên lặng kết thúc</label>
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
          {isSavingPreferences ? "Đang lưu" : "Lưu thông báo"}
        </button>
        {preferencesMessage ? <p className="muted">{preferencesMessage}</p> : null}
      </div>

      <div className="panel account-panel">
        <div>
          <h2>Nạp credit</h2>
          <p className="muted">Chuyển khoản đúng nội dung để tự động cộng credit.</p>
        </div>
        <div className="billing-actions">
          {creditPacks.map((pack, index) => (
            <button
              className={index === 0 ? "button primary" : "button"}
              type="button"
              disabled={isCreatingPayment}
              key={pack.key}
              onClick={() => createPayment({ amount: pack.amount, credits: pack.credits })}
            >
              {pack.name}
            </button>
          ))}
        </div>
        <h3>Gói theo thời gian</h3>
        <div className="billing-actions">
          {subscriptionPlans.map((plan, index) => (
            <button
              className={index === 0 ? "button primary" : "button"}
              type="button"
              disabled={isCreatingPayment}
              key={plan.key}
              onClick={() => createPayment({ planKey: plan.key })}
            >
              {plan.name}: {plan.credits} lượt / {plan.durationDays} ngày
            </button>
          ))}
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
        <div className="status-list" aria-label="Thanh toán gần đây">
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
