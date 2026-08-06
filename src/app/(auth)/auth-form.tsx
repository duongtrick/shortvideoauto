"use client";

import { useToastState } from "@/app/toast-provider";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

type Mode = "login" | "register" | "forgot" | "reset";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useToastState("");
  const [isPending, startTransition] = useTransition();
  const callbackUrl = (() => {
    const value = searchParams.get("callbackUrl");
    return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
  })();

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
          setMessage("Email hoặc mật khẩu không đúng.");
          return;
        }
        router.push(callbackUrl);
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
        setMessage(data.error ?? "Không xử lý được yêu cầu.");
        return;
      }
      if (mode === "register") {
        setMessage("Đăng ký thành công. Đăng nhập để tiếp tục.");
        router.push("/login");
        return;
      }
      if (mode === "forgot") {
        setMessage(data.resetUrl ? `Link đặt lại mật khẩu: ${data.resetUrl}` : "Kiểm tra email để đặt lại mật khẩu.");
        return;
      }
      setMessage("Đã đổi mật khẩu. Đăng nhập lại.");
      router.push("/login");
    });
  }

  return (
    <form action={submit} className="auth-form">
      {mode === "register" ? (
        <>
          <label htmlFor="name">Tên hiển thị</label>
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
          <label htmlFor="password">Mật khẩu</label>
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
          ? "Đang xử lý"
          : mode === "login"
            ? "Đăng nhập"
            : mode === "register"
              ? "Đăng ký"
              : mode === "forgot"
                ? "Gửi link"
                : "Đổi mật khẩu"}
      </button>
      {mode === "login" ? (
        <button className="button" type="button" onClick={() => signIn("google", { callbackUrl })}>
          Đăng nhập Google
        </button>
      ) : null}
      {message ? <p className="muted">{message}</p> : null}
    </form>
  );
}
