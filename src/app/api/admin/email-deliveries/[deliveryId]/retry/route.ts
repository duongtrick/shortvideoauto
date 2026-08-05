import { NextResponse } from "next/server";
import { requireAdmin } from "@/services/auth";
import { retryEmailDelivery } from "@/services/notifications";

type RouteContext = {
  params: Promise<{ deliveryId: string }>;
};

export async function POST(_: Request, context: RouteContext) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { deliveryId } = await context.params;
  const delivery = await retryEmailDelivery(deliveryId);
  if (!delivery) return NextResponse.json({ error: "Email delivery not found." }, { status: 404 });

  return NextResponse.json({ delivery });
}
