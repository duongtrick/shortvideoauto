import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "../auth-form";
import { AuthShell } from "../auth-shell";

export const metadata: Metadata = {
  title: "Gửi lại xác minh email",
  robots: { index: false, follow: false }
};

export default function ResendVerificationPage() {
  return (
    <AuthShell title="Gửi lại xác minh email" description="Nhập email để nhận link xác minh mới.">
      <Suspense fallback={<p className="muted">Đang tải form...</p>}>
        <AuthForm mode="resend" />
      </Suspense>
      <div className="auth-link-row">
        <Link href="/login">Quay lại đăng nhập</Link>
      </div>
    </AuthShell>
  );
}
