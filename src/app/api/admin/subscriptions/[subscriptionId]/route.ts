import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminSubscriptionPatch } from "@/lib/admin-subscription-validation";
import { requireAdmin } from "@/services/auth";
import { writeAuditLog } from "@/services/audit";

type RouteContext = {
  params: Promise<{ subscriptionId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { subscriptionId } = await context.params;
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const parsed = adminSubscriptionPatch.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid subscription." }, { status: 400 });

  const subscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      provider: parsed.data.provider,
      status: parsed.data.status,
      currentPeriodEnd:
        parsed.data.currentPeriodEnd === undefined
          ? undefined
          : parsed.data.currentPeriodEnd
            ? new Date(parsed.data.currentPeriodEnd)
            : null
    }
  });
  await writeAuditLog(prisma, {
    userId: admin.id,
    action: "subscription.admin_update",
    entity: "Subscription",
    entityId: subscription.id,
    meta: { status: subscription.status }
  });

  return NextResponse.json({ subscription });
}

export async function DELETE(_: Request, context: RouteContext) {
  const { subscriptionId } = await context.params;
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const subscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status: "canceled" }
  });
  await writeAuditLog(prisma, {
    userId: admin.id,
    action: "subscription.cancel",
    entity: "Subscription",
    entityId: subscription.id
  });

  return NextResponse.json({ subscription });
}
