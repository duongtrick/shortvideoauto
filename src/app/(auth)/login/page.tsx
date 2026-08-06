import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "../auth-form";
import { AuthShell } from "../auth-shell";

export const metadata: Metadata = {
  title: "Đăng nhập",
  robots: { index: false, follow: false }
};

export default function LoginPage() {
  return (
    <AuthShell title="Đăng nhập" description="Vào dashboard để tạo và tải video affiliate." active="login">
      <Suspense fallback={<p className="muted">Đang tải form...</p>}>
        <AuthForm mode="login" />
      </Suspense>
      <div className="auth-link-row">
        <Link href="/forgot-password">Quên mật khẩu</Link>
        <Link href="/register">Tạo tài khoản</Link>
      </div>
    </AuthShell>
  );
}
