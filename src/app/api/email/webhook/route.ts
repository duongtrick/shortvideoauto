import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { emailWebhookInput } from "@/lib/email-webhook-validation";

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!env.EMAIL_EVENT_WEBHOOK_SECRET || token !== env.EMAIL_EVENT_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Invalid email webhook token." }, { status: 401 });
  }

  const parsed = emailWebhookInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid email webhook payload." }, { status: 400 });

  const where = parsed.data.deliveryId
    ? { id: parsed.data.deliveryId }
    : { providerId: parsed.data.providerId };
  const delivery = await prisma.emailDelivery.findFirst({ where });
  if (!delivery) return NextResponse.json({ error: "Email delivery not found." }, { status: 404 });

  const updated = await prisma.emailDelivery.update({
    where: { id: delivery.id },
    data: {
      status: parsed.data.status,
      lastError: parsed.data.error ?? null,
      sentAt: delivery.sentAt ?? (parsed.data.status === "sent" || parsed.data.status === "delivered" ? new Date() : null)
    }
  });

  return NextResponse.json({ delivery: updated, eventType: parsed.data.eventType ?? parsed.data.status });
}
