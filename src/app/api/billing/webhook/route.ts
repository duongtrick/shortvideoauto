import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/services/billing";

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (
    !verifyWebhookSignature({
      payload,
      signature,
      secret: process.env.STRIPE_WEBHOOK_SECRET
    })
  ) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  const event = JSON.parse(payload) as { id: string; type: string };

  await prisma.billingEvent.upsert({
    where: { providerId: event.id },
    update: {},
    create: {
      provider: "stripe",
      providerId: event.id,
      type: event.type,
      payload: event
    }
  });

  return NextResponse.json({ received: true });
}
