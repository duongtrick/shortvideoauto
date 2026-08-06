import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminProviderTestInput } from "@/lib/admin-provider-validation";
import { adminAuthStatus, requireAdmin } from "@/services/auth";

type RouteContext = {
  params: Promise<{ providerId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { providerId } = await context.params;
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json({ error: "Admin access required." }, { status: adminAuthStatus(error) });
  }

  const parsed = adminProviderTestInput.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid test input." }, { status: 400 });

  const provider = await prisma.aIProvider.findUnique({ where: { id: providerId } });
  if (!provider) return NextResponse.json({ error: "AI provider not found." }, { status: 404 });

  return NextResponse.json({
    ok: true,
    provider: { id: provider.id, key: provider.key, name: provider.name, isActive: provider.isActive },
    sample: {
      prompt: parsed.data.text,
      expectedShape: [{ angle: "review nhanh", content: "Noi dung mau", score: 80 }]
    }
  });
}
