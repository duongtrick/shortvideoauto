import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { inspirationInput, inspirationQuery } from "@/lib/inspiration-validation";
import { requireCurrentUser } from "@/services/auth";
import { normalizeInspirationUrl, summarizeInspiration } from "@/services/inspiration";
import { writeAuditLog } from "@/services/audit";

export async function GET(request: Request) {
  const user = await requireCurrentUser();
  const url = new URL(request.url);
  const parsed = inspirationQuery.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Invalid inspiration filters." }, { status: 400 });

  const filters = parsed.data;
  const examples = await prisma.inspirationExample.findMany({
    where: {
      userId: user.id,
      platform: filters.platform,
      templateKey: filters.templateKey,
      OR: filters.search
        ? [
            { title: { contains: filters.search, mode: "insensitive" } },
            { hook: { contains: filters.search, mode: "insensitive" } },
            { cta: { contains: filters.search, mode: "insensitive" } },
            { notes: { contains: filters.search, mode: "insensitive" } },
            { tags: { has: filters.search } }
          ]
        : undefined
    },
    take: filters.take,
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({
    examples: examples.map((example) => ({
      ...example,
      summary: summarizeInspiration(example)
    }))
  });
}

export async function POST(request: Request) {
  const user = await requireCurrentUser();
  const parsed = inspirationInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid inspiration example." }, { status: 400 });

  let sourceUrl: string;
  try {
    sourceUrl = normalizeInspirationUrl(parsed.data.sourceUrl);
  } catch {
    return NextResponse.json({ error: "Invalid inspiration URL." }, { status: 400 });
  }

  const example = await prisma.inspirationExample.create({
    data: {
      userId: user.id,
      sourceUrl,
      platform: parsed.data.platform,
      title: parsed.data.title,
      hook: parsed.data.hook,
      cta: parsed.data.cta,
      templateKey: parsed.data.templateKey,
      notes: parsed.data.notes,
      tags: parsed.data.tags
    }
  });
  await writeAuditLog(prisma, {
    userId: user.id,
    action: "inspiration.create",
    entity: "InspirationExample",
    entityId: example.id
  });

  return NextResponse.json({ example }, { status: 201 });
}
