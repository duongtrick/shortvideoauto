import { NextResponse } from "next/server";
import { templateMarketplaceQuery } from "@/lib/template-marketplace-validation";
import { prisma } from "@/lib/prisma";
import { createTemplatePreview, filterTemplatePreviews } from "@/services/template-marketplace";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = templateMarketplaceQuery.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Invalid template filters." }, { status: 400 });

  const templates = await prisma.videoTemplate.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" }
  });
  const previews = filterTemplatePreviews(templates.map(createTemplatePreview), parsed.data);

  return NextResponse.json({ templates: previews });
}
