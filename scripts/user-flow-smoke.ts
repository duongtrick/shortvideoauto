import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.USER_FLOW_URL ?? "http://localhost:3000";

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });

  await page.goto(`${baseUrl}/register`, { waitUntil: "networkidle" });
  await page.getByLabel("Tên hiển thị").fill("Demo User");
  await page.getByLabel("Email").fill(`demo-${Date.now()}@example.com`);
  await page.getByLabel("Mật khẩu").fill("password123");
  await page.getByRole("button", { name: /^Đăng ký$/ }).click();
  await page.waitForTimeout(1500);
  await assertNoAppCrash(page, "register submit");

  await page.goto(`${baseUrl}/forgot-password`, { waitUntil: "networkidle" });
  await page.getByLabel("Email").fill("demo@example.com");
  await page.getByRole("button", { name: /^Gửi link$/ }).click();
  await page.waitForTimeout(1000);
  await assertNoAppCrash(page, "forgot submit");

  await page.goto(`${baseUrl}/resend-verification`, { waitUntil: "networkidle" });
  await page.getByLabel("Email").fill("demo@example.com");
  await page.getByRole("button", { name: /^Gửi lại link$/ }).click();
  await page.waitForTimeout(1000);
  await assertNoAppCrash(page, "resend submit");

  await page.goto(`${baseUrl}/reset-password?token=bad-token-bad-token-bad-token-bad-token`, { waitUntil: "networkidle" });
  await page.getByLabel("Mật khẩu").fill("password123");
  await page.getByRole("button", { name: /^Đổi mật khẩu$/ }).click();
  await page.waitForTimeout(1000);
  await assertNoAppCrash(page, "reset submit");

  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await page.getByLabel("Email").fill("wrong@example.com");
  await page.getByLabel("Mật khẩu").fill("wrongpassword");
  await page.getByRole("button", { name: /^Đăng nhập$/ }).click();
  await page.waitForTimeout(1000);
  await assertNoAppCrash(page, "login submit");

  await page.goto(`${baseUrl}/dashboard`, { waitUntil: "networkidle" });
  assert.equal(page.url().includes("/login"), true, "anonymous dashboard redirects to login");

  console.log("user-flow-smoke passed");
} finally {
  await browser.close();
}

async function assertNoAppCrash(page: import("playwright").Page, label: string) {
  const body = await page.locator("body").innerText();
  assert.equal(body.includes("Runtime SyntaxError"), false, `${label} showed runtime syntax error`);
  assert.equal(body.includes("Application error"), false, `${label} showed application error`);
  assert.equal(body.includes("Internal Server Error"), false, `${label} showed internal server error`);
}
