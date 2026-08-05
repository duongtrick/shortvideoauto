import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.RESPONSIVE_CHECK_URL ?? "http://localhost:3001";
const path = process.env.RESPONSIVE_CHECK_PATH ?? "/dashboard";
const widths = [320, 375, 428, 768, 1024, 1280, 1920];

const browser = await chromium.launch({ headless: true });

try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
    const result = await page.evaluate(() => ({
      width: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bottomNav: document.querySelector(".bottom-nav")
        ? getComputedStyle(document.querySelector(".bottom-nav") as Element).display
        : "missing",
      inputFontSize: document.querySelector("input")
        ? getComputedStyle(document.querySelector("input") as Element).fontSize
        : "16px"
    }));
    await page.close();

    assert.equal(result.scrollWidth <= result.width, true, `horizontal overflow at ${width}px`);
    assert.equal(parseInt(result.inputFontSize, 10) >= 16, true, `input font too small at ${width}px`);
    if (result.bottomNav !== "missing") {
      if (width < 768) assert.equal(result.bottomNav, "grid", `bottom nav hidden at ${width}px`);
      if (width >= 768) assert.equal(result.bottomNav, "none", `bottom nav visible at ${width}px`);
    }
  }
} finally {
  await browser.close();
}

console.log("responsive-check passed");
