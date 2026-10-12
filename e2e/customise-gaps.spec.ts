import { expect, test, type Page } from "@playwright/test";

// 1×1 PNG; real browser upload path (jsdom tests stub URL.createObjectURL).
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
const MAX = 5 * 1024 * 1024;

const preview = (page: Page) => page.getByRole("region", { name: "Xem trước thiệp" });
const bg = (page: Page) => preview(page).evaluate((el) => getComputedStyle(el).backgroundImage);
const error = (page: Page) => page.locator("#f-background-error");
const pick = (page: Page, name: string, mimeType: string, buffer: Buffer) =>
  page.getByLabel("Ảnh nền").setInputFiles({ name, mimeType, buffer });

test.beforeEach(async ({ page }) => {
  await page.goto("/tao?mau=hoa-dao", { waitUntil: "networkidle" });
  await expect(preview(page)).toBeVisible();
});

test("a PNG at exactly 5 MB becomes the background; 5 MB + 1 and a GIF are refused in Vietnamese", async ({ page }) => {
  expect(await bg(page)).toBe("none");
  const exact = Buffer.concat([PNG, Buffer.alloc(MAX - PNG.length)]);
  await pick(page, "anh.png", "image/png", exact);
  await expect.poll(() => bg(page)).toContain('url("blob:');
  const accepted = await bg(page);

  await pick(page, "to.jpg", "image/jpeg", Buffer.alloc(MAX + 1));
  await expect(error(page)).toHaveText("Ảnh nền không được lớn hơn 5 MB");
  expect(await bg(page)).toBe(accepted);

  await pick(page, "anh.gif", "image/gif", Buffer.from("GIF89a"));
  await expect(error(page)).toHaveText("Ảnh nền phải là tệp JPG hoặc PNG");
  expect(await bg(page)).toBe(accepted);

  // A valid file after an error clears the error.
  await pick(page, "anh2.png", "image/png", PNG);
  await expect(error(page)).toHaveCount(0);
  await expect.poll(() => bg(page)).not.toBe(accepted);
});

test("Xoá ảnh nền restores the template default and keeps every typed value", async ({ page }) => {
  const values: Record<string, string> = {
    "Tên cô dâu": "Nguyễn Thị Hằng",
    "Tên chú rể": "Trần Văn Minh",
    "Địa điểm": "Nhà hàng Sen",
    "Lời mời": "Trân trọng kính mời",
  };
  for (const [label, value] of Object.entries(values)) await page.getByLabel(label).fill(value);
  const xoa = page.getByRole("button", { name: "Xoá ảnh nền" });
  await expect(xoa).toBeDisabled();

  await page.getByRole("radio", { name: "Đỏ son" }).check();
  await page.getByRole("radio", { name: "Playfair Display" }).check();
  await pick(page, "anh.png", "image/png", PNG);
  await expect.poll(() => bg(page)).toContain('url("blob:');
  await xoa.click();

  expect(await bg(page)).toBe("none");
  await expect(xoa).toBeDisabled();
  for (const [label, value] of Object.entries(values)) {
    await expect(page.getByLabel(label)).toHaveValue(value);
  }
  await expect(preview(page)).toContainText("Nguyễn Thị Hằng");
});
