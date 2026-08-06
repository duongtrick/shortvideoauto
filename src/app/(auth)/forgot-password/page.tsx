import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "../auth-form";
import { AuthShell } from "../auth-shell";

export const metadata: Metadata = {
  title: "Quên mật khẩu",
  robots: { index: false, follow: false }
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Quên mật khẩu" description="Nhập email để nhận link đặt lại mật khẩu.">
      <Suspense fallback={<p className="muted">Đang tải form...</p>}>
        <AuthForm mode="forgot" />
      </Suspense>
      <div className="auth-link-row">
        <Link href="/login">Quay lại đăng nhập</Link>
      </div>
    </AuthShell>
  );
}
