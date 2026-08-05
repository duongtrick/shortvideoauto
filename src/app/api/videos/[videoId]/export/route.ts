import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/services/auth";
import { createVideoExportBundle } from "@/services/video-export";

type RouteContext = {
  params: Promise<{ videoId: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const user = await requireCurrentUser();
  const { videoId } = await context.params;
  const video = await prisma.video.findFirst({
    where: { id: videoId, userId: user.id },
    include: {
      job: {
        include: {
          productSource: true,
          scriptVariants: true,
          series: true
        }
      }
    }
  });

  if (!video) return NextResponse.json({ error: "Video not found." }, { status: 404 });

  return NextResponse.json(createVideoExportBundle(video));
}
