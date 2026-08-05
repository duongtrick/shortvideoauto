import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "../auth-form";
import { AuthShell } from "../auth-shell";

export const metadata: Metadata = {
  title: "Dang ky",
  robots: { index: false, follow: false }
};

export default function RegisterPage() {
  return (
    <AuthShell title="Dang ky" description="Tao tai khoan de quan ly credit, job va video da render." active="register">
      <Suspense fallback={<p className="muted">Dang tai form...</p>}>
        <AuthForm mode="register" />
      </Suspense>
      <div className="auth-link-row">
        <Link href="/login">Da co tai khoan</Link>
      </div>
    </AuthShell>
  );
}
