import type { PrismaClient } from "@prisma/client";

export async function getAdminStats(prisma: PrismaClient) {
  const [users, jobs, videos, failedJobs, paidPayments, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.renderJob.count(),
    prisma.video.count(),
    prisma.renderJob.count({ where: { status: "failed" } }),
    prisma.payment.count({ where: { status: "paid" } }),
    prisma.payment.aggregate({
      where: { status: "paid" },
      _sum: { amount: true, credits: true }
    })
  ]);

  return {
    users,
    jobs,
    videos,
    failedJobs,
    paidPayments,
    revenueVnd: revenue._sum.amount ?? 0,
    creditsSold: revenue._sum.credits ?? 0
  };
}
