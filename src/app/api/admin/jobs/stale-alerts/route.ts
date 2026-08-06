import { NextResponse } from "next/server";
import { queuedJobAlertInput } from "@/lib/job-alert-validation";
import { adminAuthStatus, requireAdmin } from "@/services/auth";
import { alertQueuedTooLongJobs } from "@/services/notifications";

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json({ error: "Admin access required." }, { status: adminAuthStatus(error) });
  }

  const parsed = queuedJobAlertInput.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid stale job alert input." }, { status: 400 });

  const alertedJobIds = await alertQueuedTooLongJobs(parsed.data);
  return NextResponse.json({ alertedJobIds });
}
