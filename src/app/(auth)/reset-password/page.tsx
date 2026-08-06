import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "../auth-form";
import { AuthShell } from "../auth-shell";

export const metadata: Metadata = {
  title: "Đổi mật khẩu",
  robots: { index: false, follow: false }
};

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Đổi mật khẩu" description="Nhập mật khẩu mới cho tài khoản.">
      <Suspense fallback={<p className="muted">Đang tải form...</p>}>
        <AuthForm mode="reset" />
      </Suspense>
      <div className="auth-link-row">
        <Link href="/login">Quay lại đăng nhập</Link>
      </div>
    </AuthShell>
  );
}
