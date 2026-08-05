import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminSubscriptionInput } from "@/lib/admin-subscription-validation";
import { requireAdmin } from "@/services/auth";
import { writeAuditLog } from "@/services/audit";

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || undefined;
  const q = url.searchParams.get("q")?.trim();
  const take = Math.min(Number(url.searchParams.get("take") || 50), 100);

  const subscriptions = await prisma.subscription.findMany({
    where: {
      status,
      OR: q
        ? [
            { provider: { contains: q, mode: "insensitive" } },
            { providerId: { contains: q, mode: "insensitive" } },
            { user: { email: { contains: q, mode: "insensitive" } } }
          ]
        : undefined
    },
    take,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, email: true } } }
  });

  return NextResponse.json({ subscriptions });
}

export async function POST(request: Request) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const parsed = adminSubscriptionInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid subscription." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.userEmail } });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const subscription = await prisma.subscription.create({
    data: {
      userId: user.id,
      provider: parsed.data.provider,
      providerId: parsed.data.providerId,
      status: parsed.data.status,
      currentPeriodEnd: parsed.data.currentPeriodEnd ? new Date(parsed.data.currentPeriodEnd) : undefined
    }
  });
  await writeAuditLog(prisma, {
    userId: admin.id,
    action: "subscription.admin_create",
    entity: "Subscription",
    entityId: subscription.id,
    meta: { userId: user.id, status: subscription.status }
  });

  return NextResponse.json({ subscription }, { status: 201 });
}
