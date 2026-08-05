import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/services/auth";
import { createReferralCode } from "@/services/referrals";

export async function GET() {
  const user = await requireCurrentUser();
  const code = createReferralCode(user.id);

  const referral = await prisma.referral.upsert({
    where: { code },
    update: {},
    create: { code, referrerUserId: user.id }
  });
  const commissions = await prisma.affiliateCommission.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return NextResponse.json({
    referralLink: `${process.env.APP_URL ?? "http://localhost:3000"}/register?ref=${referral.code}`,
    referral,
    commissions
  });
}
