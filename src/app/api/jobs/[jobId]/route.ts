import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jobPreviewPatch } from "@/lib/job-preview-validation";
import { requireCurrentUser } from "@/services/auth";
import { writeAuditLog } from "@/services/audit";

export async function GET(_: Request, context: { params: Promise<{ jobId: string }> }) {
  const user = await requireCurrentUser();
  const { jobId } = await context.params;
  const job = await prisma.renderJob.findFirst({
    where: { id: jobId, userId: user.id },
    include: {
      scriptVariants: true,
      outputVideo: true,
      productSource: true
    }
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  return NextResponse.json({ job });
}

export async function PATCH(request: Request, context: { params: Promise<{ jobId: string }> }) {
  const user = await requireCurrentUser();
  const { jobId } = await context.params;
  const parsed = jobPreviewPatch.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid preview edits." }, { status: 400 });

  const job = await prisma.renderJob.findFirst({
    where: { id: jobId, userId: user.id },
    include: { productSource: true, scriptVariants: true }
  });
  if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 });

  if (parsed.data.selectedScriptId && !job.scriptVariants.some((script) => script.id === parsed.data.selectedScriptId)) {
    return NextResponse.json({ error: "Script not found." }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    const previewConfig = {
      voice: parsed.data.voice,
      musicTrack: parsed.data.musicTrack,
      musicVolume: parsed.data.musicVolume,
      captionPreset: parsed.data.captionPreset,
      cta: parsed.data.cta
    };
    const hasPreviewConfig = Object.values(previewConfig).some((value) => value !== undefined);
    if (job.productSource && (parsed.data.productTitle || parsed.data.price || parsed.data.imageUrls || hasPreviewConfig)) {
      const raw = job.productSource.raw && typeof job.productSource.raw === "object" && !Array.isArray(job.productSource.raw)
        ? job.productSource.raw
        : {};
      await tx.productSource.update({
        where: { id: job.productSource.id },
        data: {
          title: parsed.data.productTitle,
          price: parsed.data.price,
          imageUrls: parsed.data.imageUrls,
          raw: hasPreviewConfig
            ? {
                ...raw,
                previewConfig: {
                  ...(typeof raw.previewConfig === "object" && raw.previewConfig !== null && !Array.isArray(raw.previewConfig)
                    ? raw.previewConfig
                    : {}),
                  ...Object.fromEntries(Object.entries(previewConfig).filter(([, value]) => value !== undefined))
                }
              }
            : undefined
        }
      });
    }

    if (parsed.data.selectedScriptId && parsed.data.scriptContent) {
      await tx.scriptVariant.update({
        where: { id: parsed.data.selectedScriptId },
        data: {
          content: parsed.data.cta ? `${parsed.data.scriptContent}\nCTA: ${parsed.data.cta}` : parsed.data.scriptContent,
          score: 100
        }
      });
    }

    await tx.renderJob.update({
      where: { id: job.id },
      data: { selectedScriptId: parsed.data.selectedScriptId }
    });
  });

  await writeAuditLog(prisma, {
    userId: user.id,
    action: "job.preview_update",
    entity: "RenderJob",
    entityId: job.id
  });

  const updated = await prisma.renderJob.findFirst({
    where: { id: job.id, userId: user.id },
    include: {
      scriptVariants: true,
      outputVideo: true,
      productSource: true
    }
  });

  return NextResponse.json({ job: updated });
}
