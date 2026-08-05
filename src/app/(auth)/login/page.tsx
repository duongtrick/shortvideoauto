import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "../auth-form";
import { AuthShell } from "../auth-shell";

export const metadata: Metadata = {
  title: "Dang nhap",
  robots: { index: false, follow: false }
};

export default function LoginPage() {
  return (
    <AuthShell title="Dang nhap" description="Vao dashboard de tao va tai video affiliate." active="login">
      <Suspense fallback={<p className="muted">Dang tai form...</p>}>
        <AuthForm mode="login" />
      </Suspense>
      <div className="auth-link-row">
        <Link href="/forgot-password">Quen mat khau</Link>
        <Link href="/register">Tao tai khoan</Link>
      </div>
    </AuthShell>
  );
}
