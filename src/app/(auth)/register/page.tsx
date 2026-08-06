import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "../auth-form";
import { AuthShell } from "../auth-shell";

export const metadata: Metadata = {
  title: "Đăng ký",
  robots: { index: false, follow: false }
};

export default function RegisterPage() {
  return (
    <AuthShell title="Đăng ký" description="Tạo tài khoản để quản lý credit, job và video đã render." active="register">
      <Suspense fallback={<p className="muted">Đang tải form...</p>}>
        <AuthForm mode="register" />
      </Suspense>
      <div className="auth-link-row">
        <Link href="/login">Đã có tài khoản</Link>
      </div>
    </AuthShell>
  );
}
