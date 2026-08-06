import assert from "node:assert/strict";

const baseUrl = process.env.ROUTE_SMOKE_URL ?? "http://localhost:3000";
const includeDbRoutes = process.env.ROUTE_SMOKE_INCLUDE_DB === "true";

type RouteCase = {
  path: string;
  statuses: number[];
  mustInclude?: string;
  locationIncludes?: string;
};

const publicCases: RouteCase[] = [
  { path: "/", statuses: [200], mustInclude: "ShortVideoAuto" },
  { path: "/login", statuses: [200], mustInclude: "Đăng nhập" },
  { path: "/register", statuses: [200], mustInclude: "Đăng ký" },
  { path: "/forgot-password", statuses: [200], mustInclude: "Quên mật khẩu" },
  { path: "/reset-password", statuses: [200], mustInclude: "Đổi mật khẩu" },
  { path: "/resend-verification", statuses: [200], mustInclude: "Gửi lại xác minh email" },
  { path: "/verify-email?token=bad", statuses: [200], mustInclude: "Xác minh email" },
  { path: "/robots.txt", statuses: [200], mustInclude: "User-Agent" },
  { path: "/sitemap.xml", statuses: [200], mustInclude: "<urlset" },
  { path: "/tao-video-affiliate-tu-dong", statuses: [200], mustInclude: "ShortVideoAuto" },
  { path: "/tao-video-shopee-affiliate", statuses: [200], mustInclude: "ShortVideoAuto" },
  { path: "/ai-tao-video-tiktok-ban-hang", statuses: [200], mustInclude: "ShortVideoAuto" },
  { path: "/tool-lam-video-affiliate", statuses: [200], mustInclude: "ShortVideoAuto" },
  { path: "/dashboard", statuses: [200, 302, 307] },
  { path: "/account", statuses: [200, 302, 307] },
  { path: "/samples/demo", statuses: [200] },
  { path: "/admin", statuses: [302, 307], locationIncludes: "/login" },
  { path: "/admin/users", statuses: [302, 307], locationIncludes: "/login" },
  { path: "/admin/jobs", statuses: [302, 307], locationIncludes: "/login" },
  { path: "/admin/videos", statuses: [302, 307], locationIncludes: "/login" },
  { path: "/admin/payments", statuses: [302, 307], locationIncludes: "/login" },
  { path: "/admin/templates", statuses: [302, 307], locationIncludes: "/login" },
  { path: "/admin/audit-logs", statuses: [302, 307], locationIncludes: "/login" },
  { path: "/admin/analytics", statuses: [302, 307], locationIncludes: "/login" },
  { path: "/api/admin/health", statuses: [401] },
  { path: "/api/admin/users", statuses: [401] },
  { path: "/api/admin/payments", statuses: [401] },
  { path: "/api/admin/audit-logs", statuses: [401] }
];

const dbCases: RouteCase[] = [
  { path: "/api/jobs", statuses: [200, 302, 307, 401, 403] },
  { path: "/api/videos", statuses: [200, 302, 307, 401, 403] },
  { path: "/api/notifications", statuses: [200, 302, 307, 401, 403] },
  { path: "/api/admin/health", statuses: [200, 302, 307, 401, 403] },
  { path: "/api/admin/stats", statuses: [200, 302, 307, 401, 403] }
];

const cases = includeDbRoutes ? [...publicCases, ...dbCases] : publicCases;

for (const route of cases) {
  const response = await fetch(`${baseUrl}${route.path}`, { redirect: "manual" });
  assert.equal(
    route.statuses.includes(response.status),
    true,
    `${route.path} returned ${response.status}, expected ${route.statuses.join(", ")}`
  );

  const contentType = response.headers.get("content-type") ?? "";
  if (response.status === 200 && contentType.includes("text")) {
    const body = await response.text();
    assert.equal(body.includes("Internal Server Error"), false, `${route.path} rendered 500 text`);
    assert.equal(body.includes("Application error"), false, `${route.path} rendered app error`);
    if (route.mustInclude) {
      assert.equal(body.includes(route.mustInclude), true, `${route.path} missing ${route.mustInclude}`);
    }
  }

  if (route.locationIncludes) {
    const location = response.headers.get("location") ?? "";
    assert.equal(location.includes(route.locationIncludes), true, `${route.path} redirect missing ${route.locationIncludes}`);
  }
}

console.log(`route-smoke passed (${includeDbRoutes ? "public + db" : "public routes"})`);
