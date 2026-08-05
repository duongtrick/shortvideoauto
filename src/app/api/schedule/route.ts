import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scheduledPostInput, scheduleQuery } from "@/lib/scheduler-validation";
import { requireCurrentUser } from "@/services/auth";
import { writeAuditLog } from "@/services/audit";
import { createManualPublishChecklist } from "@/services/scheduler";

export async function GET(request: Request) {
  const user = await requireCurrentUser();
  const url = new URL(request.url);
  const parsed = scheduleQuery.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Invalid schedule filters." }, { status: 400 });

  const filters = parsed.data;
  const posts = await prisma.scheduledPost.findMany({
    where: {
      userId: user.id,
      status: filters.status,
      platform: filters.platform,
      scheduledAt: {
        gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        lte: filters.dateTo ? new Date(filters.dateTo) : undefined
      }
    },
    take: filters.take,
    orderBy: { scheduledAt: "asc" },
    include: { video: true }
  });

  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const user = await requireCurrentUser();
  const parsed = scheduledPostInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid scheduled post." }, { status: 400 });

  const video = await prisma.video.findFirst({ where: { id: parsed.data.videoId, userId: user.id } });
  if (!video) return NextResponse.json({ error: "Video not found." }, { status: 404 });

  const post = await prisma.scheduledPost.create({
    data: {
      userId: user.id,
      videoId: video.id,
      platform: parsed.data.platform,
      title: parsed.data.title,
      caption: parsed.data.caption,
      hashtags: parsed.data.hashtags,
      scheduledAt: new Date(parsed.data.scheduledAt),
      manualChecklist: createManualPublishChecklist(parsed.data.platform)
    }
  });
  await writeAuditLog(prisma, {
    userId: user.id,
    action: "schedule.create",
    entity: "ScheduledPost",
    entityId: post.id
  });

  return NextResponse.json({ post }, { status: 201 });
}
