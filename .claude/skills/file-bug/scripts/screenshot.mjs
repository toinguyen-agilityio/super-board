// Screenshot a page for a bug ticket: desktop 1280 wide, plus mobile 375 with --mobile.
// Prints the browser console so it can go in the Evidence "Logs" row.
//
//   node .claude/skills/file-bug/scripts/screenshot.mjs <url> <out-dir> [--mobile]
//
// Writes <out-dir>/desktop.png (and <out-dir>/mobile.png).
// Set CHROMIUM_PATH to use a Chromium that is already installed instead of Playwright's.
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const [url, outDir, ...flags] = process.argv.slice(2);
if (!url || !outDir) {
  console.error("usage: screenshot.mjs <url> <out-dir> [--mobile]");
  process.exit(64);
}

const viewports = [["desktop", { width: 1280, height: 800 }]];
if (flags.includes("--mobile")) viewports.push(["mobile", { width: 375, height: 812 }]);

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
try {
  for (const [name, viewport] of viewports) {
    const page = await browser.newPage({ viewport });
    page.on("console", (msg) => console.log(`[${name}] console.${msg.type()}: ${msg.text()}`));
    page.on("pageerror", (err) => console.log(`[${name}] pageerror: ${err.message}`));
    await page.goto(url, { waitUntil: "networkidle" });
    const file = join(outDir, `${name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`saved ${file}`);
    await page.close();
  }
} finally {
  await browser.close();
}
