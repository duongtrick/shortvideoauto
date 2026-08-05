import type { PrismaClient } from "@prisma/client";

export async function getAdminStats(prisma: PrismaClient) {
  const [
    users,
    jobs,
    videos,
    failedJobs,
    paidPayments,
    auditLogs,
    revenue,
    emailDeliveries,
    failedEmailDeliveries,
    pendingEmailDeliveries
  ] = await Promise.all([
    prisma.user.count(),
    prisma.renderJob.count(),
    prisma.video.count(),
    prisma.renderJob.count({ where: { status: "failed" } }),
    prisma.payment.count({ where: { status: "paid" } }),
    prisma.auditLog.count(),
    prisma.payment.aggregate({
      where: { status: "paid" },
      _sum: { amount: true, credits: true }
    }),
    prisma.emailDelivery.count(),
    prisma.emailDelivery.count({ where: { status: "failed" } }),
    prisma.emailDelivery.count({ where: { status: { in: ["pending", "deferred", "digest_pending"] } } })
  ]);

  return {
    users,
    jobs,
    videos,
    failedJobs,
    paidPayments,
    auditLogs,
    emailDeliveries,
    failedEmailDeliveries,
    pendingEmailDeliveries,
    revenueVnd: revenue._sum.amount ?? 0,
    creditsSold: revenue._sum.credits ?? 0
  };
}
