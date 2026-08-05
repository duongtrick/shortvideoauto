import { NextResponse, type NextRequest } from "next/server";
import { resolveTenantDomain } from "@/lib/domains";

export function middleware(request: NextRequest) {
  const tenant = resolveTenantDomain(request.headers.get("host"));
  const response = NextResponse.next();
  response.headers.set("x-tenant-domain", tenant.host);
  response.headers.set("x-tenant-brand", tenant.brand);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
