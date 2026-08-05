"use client";

import { signOut } from "next-auth/react";
import { useState, useTransition } from "react";

export function AccountForm({ email }: { email: string }) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

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

  return (
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
  );
}
