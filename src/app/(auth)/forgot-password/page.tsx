import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "../auth-form";
import { AuthShell } from "../auth-shell";

export const metadata: Metadata = {
  title: "Quen mat khau",
  robots: { index: false, follow: false }
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Quen mat khau" description="Nhap email de nhan link dat lai mat khau.">
      <Suspense fallback={<p className="muted">Dang tai form...</p>}>
        <AuthForm mode="forgot" />
      </Suspense>
      <div className="auth-link-row">
        <Link href="/login">Quay lai dang nhap</Link>
      </div>
    </AuthShell>
  );
}
