"use client";

import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/admin/users": "User management",
  "/admin/jobs": "Job management",
  "/admin/videos": "Video management",
  "/admin/payments": "Payment management",
  "/admin/templates": "Template management",
  "/admin/tts": "TTS providers",
  "/admin/ai": "AI providers",
  "/admin/settings": "System settings",
  "/admin/audit-logs": "Audit logs",
  "/admin/analytics": "Analytics"
};

export function AdminTitle() {
  const pathname = usePathname();
  return <h1>{titles[pathname] ?? "Admin"}</h1>;
}
