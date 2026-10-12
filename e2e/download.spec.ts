import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

async function fillAll(page: Page) {
  await page.goto("/tao?mau=hoa-dao", { waitUntil: "networkidle" });
  await page.getByLabel("Tên cô dâu").fill("Nguyễn Thị Hằng");
  await page.getByLabel("Tên chú rể").fill("Trần Văn Đức");
  await page.getByLabel("Ngày giờ").fill("2026-12-20T18:00");
  await page.getByLabel("Địa điểm").fill("Hà Nội");
}

test("Xem trước goes full screen; Esc and Đóng return with input kept", async ({ page }) => {
  await fillAll(page);
  await page.getByRole("button", { name: "Xem trước" }).click();
  const dialog = page.getByRole("dialog", { name: "Xem trước toàn màn hình" });
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  expect(box?.width).toBe(page.viewportSize()?.width);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await page.getByRole("button", { name: "Xem trước" }).click();
  await page.getByRole("button", { name: "Đóng" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByLabel("Tên cô dâu")).toHaveValue("Nguyễn Thị Hằng");
});

for (const viewport of [{ width: 1920, height: 1080 }, { width: 375, height: 667 }]) {
  test(`Tải về saves a PNG at least 1080 px wide at ${viewport.width} px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await fillAll(page);
    await page.getByRole("radio", { name: "Dancing Script" }).check();
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Tải về" }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("thiep-cuoi-Nguyen-Thi-Hang-Tran-Van-Duc.png");
    const png = readFileSync((await download.path())!);
    expect(png.subarray(1, 4).toString()).toBe("PNG");
    expect(png.readUInt32BE(16)).toBeGreaterThanOrEqual(1080);
  });
}
