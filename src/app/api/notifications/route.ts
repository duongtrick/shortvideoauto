import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificationPreferenceInput } from "@/lib/notification-validation";
import { requireCurrentUser } from "@/services/auth";

export async function GET() {
  const user = await requireCurrentUser();
  const [notifications, preferences] = await Promise.all([
    prisma.inAppNotification.findMany({
      where: { userId: user.id },
      take: 50,
      orderBy: { createdAt: "desc" }
    }),
    prisma.notificationPreference.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id }
    })
  ]);

  return NextResponse.json({ notifications, preferences });
}

export async function PATCH(request: Request) {
  const user = await requireCurrentUser();
  const parsed = notificationPreferenceInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid notification preferences." }, { status: 400 });

  const preferences = await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    update: parsed.data,
    create: { userId: user.id, ...parsed.data }
  });

  return NextResponse.json({ preferences });
}
