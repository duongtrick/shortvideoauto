"use client";

import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/admin/users": "User management",
  "/admin/jobs": "Job management",
  "/admin/payments": "Payment management",
  "/admin/templates": "Template management",
  "/admin/settings": "System settings",
  "/admin/audit-logs": "Audit logs"
};

export function AdminTitle() {
  const pathname = usePathname();
  return <h1>{titles[pathname] ?? "Admin"}</h1>;
}
