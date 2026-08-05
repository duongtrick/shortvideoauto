import { NextResponse } from "next/server";
import { captionExportInput } from "@/lib/caption-validation";
import { exportSrt, exportVtt } from "@/services/captions";

export async function POST(request: Request) {
  const parsed = captionExportInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid captions." }, { status: 400 });

  const body = parsed.data.format === "srt" ? exportSrt(parsed.data.segments) : exportVtt(parsed.data.segments);
  return new Response(body, {
    headers: {
      "content-type": parsed.data.format === "srt" ? "application/x-subrip; charset=utf-8" : "text/vtt; charset=utf-8"
    }
  });
}
