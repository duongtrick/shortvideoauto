import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/services/auth";

type RouteContext = {
  params: Promise<{ notificationId: string }>;
};

export async function PATCH(_: Request, context: RouteContext) {
  const user = await requireCurrentUser();
  const { notificationId } = await context.params;

  const notification = await prisma.inAppNotification.findFirst({
    where: { id: notificationId, userId: user.id }
  });
  if (!notification) return NextResponse.json({ error: "Notification not found." }, { status: 404 });

  const updated = await prisma.inAppNotification.update({
    where: { id: notification.id },
    data: { readAt: notification.readAt ?? new Date() }
  });

  return NextResponse.json({ notification: updated });
}
