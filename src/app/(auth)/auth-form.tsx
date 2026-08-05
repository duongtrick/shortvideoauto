"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

type Mode = "login" | "register" | "forgot" | "reset";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    setMessage("");
    startTransition(async () => {
      if (mode === "login") {
        const result = await signIn("credentials", {
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
          redirect: false
        });
        if (result?.error) {
          setMessage("Email hoac mat khau khong dung.");
          return;
        }
        router.push("/dashboard");
        return;
      }

      const endpoint =
        mode === "register"
          ? "/api/auth/register"
          : mode === "forgot"
            ? "/api/auth/forgot-password"
            : "/api/auth/reset-password";

      const body =
        mode === "reset"
          ? {
              token: searchParams.get("token") ?? "",
              password: String(formData.get("password") ?? "")
            }
          : Object.fromEntries(formData);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = (await response.json()) as { error?: string; resetUrl?: string };
      if (!response.ok) {
        setMessage(data.error ?? "Khong xu ly duoc yeu cau.");
        return;
      }
      if (mode === "register") {
        setMessage("Dang ky thanh cong. Dang nhap de tiep tuc.");
        router.push("/login");
        return;
      }
      if (mode === "forgot") {
        setMessage(data.resetUrl ? `Link dat lai mat khau: ${data.resetUrl}` : "Kiem tra email de dat lai mat khau.");
        return;
      }
      setMessage("Da doi mat khau. Dang nhap lai.");
      router.push("/login");
    });
  }

  return (
    <form action={submit} className="auth-form">
      {mode === "register" ? (
        <>
          <label htmlFor="name">Ten hien thi</label>
          <input id="name" name="name" autoComplete="name" required minLength={2} />
        </>
      ) : null}
      {mode === "reset" ? null : (
        <>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
        </>
      )}
      {mode === "forgot" ? null : (
        <>
          <label htmlFor="password">Mat khau</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={8}
          />
        </>
      )}
      <button className="button primary" type="submit" disabled={isPending}>
        {isPending
          ? "Dang xu ly"
          : mode === "login"
            ? "Dang nhap"
            : mode === "register"
              ? "Dang ky"
              : mode === "forgot"
                ? "Gui link"
                : "Doi mat khau"}
      </button>
      {mode === "login" ? (
        <button className="button" type="button" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
          Dang nhap Google
        </button>
      ) : null}
      {message ? <p className="muted">{message}</p> : null}
    </form>
  );
}
