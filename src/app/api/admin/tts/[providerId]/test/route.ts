import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminProviderTestInput } from "@/lib/admin-provider-validation";
import { adminAuthStatus, requireAdmin } from "@/services/auth";
import { createPlaceholderVoice } from "@/services/tts-providers";

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

  const provider = await prisma.tTSProvider.findUnique({ where: { id: providerId } });
  if (!provider) return NextResponse.json({ error: "TTS provider not found." }, { status: 404 });

  return NextResponse.json({
    ok: true,
    provider: { id: provider.id, key: provider.key, name: provider.name, isActive: provider.isActive },
    voice: createPlaceholderVoice(`${provider.key}:${parsed.data.text}`)
  });
}
