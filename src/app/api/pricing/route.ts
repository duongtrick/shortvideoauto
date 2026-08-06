import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPricingConfig } from "@/services/pricing";

export async function GET() {
  const pricing = await getPricingConfig(prisma);
  return NextResponse.json(pricing);
}
