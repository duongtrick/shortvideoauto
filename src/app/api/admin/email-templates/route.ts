import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emailTemplatePatch, emailTemplateTestInput } from "@/lib/email-template-validation";
import { requireAdmin } from "@/services/auth";
import { writeAuditLog } from "@/services/audit";
import { createEmailDelivery } from "@/services/notifications";
import { getEmailTemplate, listEmailTemplates, saveEmailTemplate } from "@/services/email-templates";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const templates = await listEmailTemplates(prisma);
  return NextResponse.json({ templates });
}

export async function PATCH(request: Request) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const parsed = emailTemplatePatch.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid email template." }, { status: 400 });

  const template = await saveEmailTemplate(prisma, parsed.data);
  await writeAuditLog(prisma, {
    userId: admin.id,
    action: "email_template.update",
    entity: "SystemSetting",
    entityId: `email_template.${parsed.data.key}`
  });

  return NextResponse.json({ template });
}

export async function POST(request: Request) {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const parsed = emailTemplateTestInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid email template test." }, { status: 400 });

  const template = await getEmailTemplate(prisma, parsed.data.key);
  const delivery = await createEmailDelivery({
    userId: admin.id,
    event: "admin.test",
    toEmail: parsed.data.toEmail ?? admin.email,
    template: {
      subject: `[Test] ${template.subject}`,
      bodyText: template.bodyText
    }
  });

  return NextResponse.json({ delivery });
}
