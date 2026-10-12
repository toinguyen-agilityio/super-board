import { expect, test, type Page } from "@playwright/test";

const form = (page: Page) => page.locator("form");
const preview = (page: Page) => page.getByRole("region", { name: "Xem trước thiệp" });

// The editor streams in under Suspense; wait for it and for hydration before interacting.
async function open(page: Page) {
  await page.goto("/tao?mau=hoa-dao", { waitUntil: "networkidle" });
  await expect(preview(page)).toBeVisible();
}

test("typing updates the preview live", async ({ page }) => {
  await open(page);
  await page.getByLabel("Tên cô dâu").fill("Lan");
  await page.getByLabel("Tên chú rể").fill("Minh");
  await expect(preview(page)).toContainText("Lan");
  await expect(preview(page)).toContainText("Minh");
});

test("leaving a required field empty shows a Vietnamese error", async ({ page }) => {
  await open(page);
  await page.getByLabel("Địa điểm").focus();
  await page.getByLabel("Lời mời").focus();
  await expect(page.getByText("Vui lòng nhập địa điểm")).toBeVisible();
});

test("form and preview sit side by side at 1024 px", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await open(page);
  const f = (await form(page).boundingBox())!;
  const p = (await preview(page).boundingBox())!;
  expect(p.x).toBeGreaterThanOrEqual(f.x + f.width);
  expect(Math.abs(p.y - f.y)).toBeLessThan(5);
});

test("preview sits below the form at 375 px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await open(page);
  const f = (await form(page).boundingBox())!;
  const p = (await preview(page).boundingBox())!;
  expect(p.y).toBeGreaterThanOrEqual(f.y + f.height);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});
