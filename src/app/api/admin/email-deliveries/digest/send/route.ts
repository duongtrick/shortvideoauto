import { NextResponse } from "next/server";
import { emailDigestInput } from "@/lib/email-delivery-validation";
import { adminAuthStatus, requireAdmin } from "@/services/auth";
import { sendNotificationDigest } from "@/services/notifications";

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json({ error: "Admin access required." }, { status: adminAuthStatus(error) });
  }

  const parsed = emailDigestInput.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid digest input." }, { status: 400 });

  const sentUserIds = await sendNotificationDigest(parsed.data);
  return NextResponse.json({ sentUserIds });
}
