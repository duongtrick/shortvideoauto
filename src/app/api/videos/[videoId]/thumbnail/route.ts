import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/services/auth";
import { createThumbnailPlan } from "@/services/thumbnails";

type RouteContext = {
  params: Promise<{ videoId: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const user = await requireCurrentUser();
  const { videoId } = await context.params;
  const video = await prisma.video.findFirst({
    where: { id: videoId, userId: user.id },
    include: {
      job: { include: { productSource: true } }
    }
  });
  if (!video) return NextResponse.json({ error: "Video not found." }, { status: 404 });

  const product = video.job?.productSource;
  const plan = createThumbnailPlan({
    title: product?.title ?? `Video ${video.id}`,
    price: product?.price,
    imageUrl: product?.imageUrls[0],
    accent:
      product?.raw && typeof product.raw === "object" && !Array.isArray(product.raw)
        ? typeof product.raw.accent === "string"
          ? product.raw.accent
          : null
        : null
  });

  return NextResponse.json({ plan });
}
