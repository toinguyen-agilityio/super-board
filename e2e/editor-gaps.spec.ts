import { expect, test, type Page } from "@playwright/test";

const preview = (page: Page) => page.getByRole("region", { name: "Xem trước thiệp" });

async function open(page: Page) {
  await page.goto("/tao?mau=hoa-dao", { waitUntil: "networkidle" });
  await expect(preview(page)).toBeVisible();
}

test("every field reaches the preview in a real browser", async ({ page }) => {
  await open(page);
  await page.getByLabel("Tên cô dâu").fill("Lan");
  await page.getByLabel("Tên chú rể").fill("Minh");
  await page.getByLabel("Ngày giờ").fill("2026-12-20T18:00");
  await page.getByLabel("Địa điểm").fill("Nhà hàng Sen");
  await page.getByLabel("Lời mời").fill("Trân trọng kính mời");
  for (const text of ["Lan", "Minh", "18:00 · 20/12/2026", "Nhà hàng Sen", "Trân trọng kính mời"]) {
    await expect(preview(page)).toContainText(text);
  }
  await expect(page.getByRole("button")).toHaveCount(0);
});

test("Lời mời stops at 300 characters when typed", async ({ page }) => {
  await open(page);
  const message = page.getByLabel("Lời mời");
  await message.pressSequentially("x".repeat(305), { delay: 0 });
  await expect(message).toHaveValue("x".repeat(300));
  await expect(page.getByText("Còn 0 ký tự")).toBeVisible();
});

test("form and preview sit side by side at 1920 px", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await open(page);
  const f = (await page.locator("form").boundingBox())!;
  const p = (await preview(page).boundingBox())!;
  expect(p.x).toBeGreaterThanOrEqual(f.x + f.width);
  expect(Math.abs(p.y - f.y)).toBeLessThan(5);
});
