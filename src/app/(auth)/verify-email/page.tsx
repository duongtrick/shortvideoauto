import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifyEmailVerificationToken } from "@/services/email-verification";
import { writeAuditLog } from "@/services/audit";
import { AuthShell } from "../auth-shell";

export const metadata: Metadata = {
  title: "Xác minh email",
  robots: { index: false, follow: false }
};

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token ?? "";
  const email = token ? verifyEmailVerificationToken(token) : null;
  let message = "Link xác minh không hợp lệ hoặc đã hết hạn.";

  if (email) {
    const user = await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() }
    }).catch(() => null);

    if (user) {
      await writeAuditLog(prisma, {
        userId: user.id,
        action: "user.email_verify",
        entity: "User",
        entityId: user.id
      });
      message = "Email đã được xác minh. Bạn có thể đăng nhập.";
    }
  }

  return (
    <AuthShell title="Xác minh email" description={message}>
      <div className="auth-link-row">
        <Link className="button primary" href="/login">
          Đăng nhập
        </Link>
      </div>
    </AuthShell>
  );
}
