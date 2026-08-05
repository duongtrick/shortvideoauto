import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scheduleSuggestionInput } from "@/lib/scheduler-validation";
import { requireCurrentUser } from "@/services/auth";
import { suggestScheduleCopy } from "@/services/scheduler";

export async function POST(request: Request) {
  const user = await requireCurrentUser();
  const parsed = scheduleSuggestionInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid schedule suggestion input." }, { status: 400 });

  const video = await prisma.video.findFirst({
    where: { id: parsed.data.videoId, userId: user.id },
    include: {
      job: {
        include: {
          productSource: true,
          scriptVariants: { orderBy: { score: "desc" }, take: 1 }
        }
      }
    }
  });
  if (!video) return NextResponse.json({ error: "Video not found." }, { status: 404 });

  const suggestion = suggestScheduleCopy({
    platform: parsed.data.platform,
    tone: parsed.data.tone,
    productTitle: video.job?.productSource?.title,
    price: video.job?.productSource?.price,
    script: video.job?.scriptVariants[0]?.content
  });

  return NextResponse.json({ suggestion });
}
