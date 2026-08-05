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
  const [preferencesMessage, setPreferencesMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isSavingPreferences, startPreferencesTransition] = useTransition();

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
    </div>
  );
}
