import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { videoLibraryQuery } from "@/lib/video-library-validation";
import { requireAdmin } from "@/services/auth";
import { createSignedDownloadUrl } from "@/services/storage";

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const url = new URL(request.url);
  const parsed = videoLibraryQuery.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Invalid video filters." }, { status: 400 });

  const filters = parsed.data;
  const videos = await prisma.video.findMany({
    where: {
      createdAt: {
        gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        lte: filters.dateTo ? new Date(filters.dateTo) : undefined
      },
      job: {
        status: filters.status,
        seriesId: filters.seriesId,
        series: {
          templateKey: filters.templateKey,
          language: filters.language
        },
        productSource: {
          host: filters.sourceHost ? { contains: filters.sourceHost, mode: "insensitive" } : undefined
        }
      }
    },
    take: filters.take,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, email: true } },
      scheduledPosts: true,
      job: {
        include: {
          series: true,
          productSource: true,
          scriptVariants: true
        }
      }
    }
  });

  return NextResponse.json({
    videos: videos.map((video) => ({
      ...video,
      downloadUrl: createSignedDownloadUrl(video.storageKey)
    }))
  });
}
