import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "../auth-form";
import { AuthShell } from "../auth-shell";

export const metadata: Metadata = {
  title: "Doi mat khau",
  robots: { index: false, follow: false }
};

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Doi mat khau" description="Nhap mat khau moi cho tai khoan.">
      <Suspense fallback={<p className="muted">Dang tai form...</p>}>
        <AuthForm mode="reset" />
      </Suspense>
      <div className="auth-link-row">
        <Link href="/login">Quay lai dang nhap</Link>
      </div>
    </AuthShell>
  );
}
