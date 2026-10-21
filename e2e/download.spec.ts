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

for (const [ratio, w, h] of [["Dọc 4:5", 4, 5], ["Story 9:16", 9, 16], ["Vuông 1:1", 1, 1]] as const) {
  test(`${ratio} downloads a PNG of that ratio, at least 1080 px wide`, async ({ page }) => {
    await fillAll(page);
    await page.getByRole("radio", { name: ratio }).check();
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Tải về" }).click(),
    ]);
    const png = readFileSync((await download.path())!);
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);
    expect(width).toBeGreaterThanOrEqual(1080);
    expect(Math.abs(width / height - w / h)).toBeLessThan(0.01);
  });
}

test("PDF downloads a one-page .pdf with the invitation file name", async ({ page }) => {
  await fillAll(page);
  await page.getByRole("radio", { name: "PDF" }).check();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Tải về" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("thiep-cuoi-Nguyen-Thi-Hang-Tran-Van-Duc.pdf");
  const pdf = readFileSync((await download.path())!).toString("latin1");
  expect(pdf.startsWith("%PDF-")).toBe(true);
  expect(pdf.match(/\/Type \/Page\b(?!s)/g)).toHaveLength(1);
});

test("2x and 3x export different sizes (1080 and 1620 px wide)", async ({ page }) => {
  await fillAll(page);
  const widths: number[] = [];
  for (const q of ["2x", "3x"]) {
    await page.getByRole("radio", { name: q }).check();
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Tải về" }).click(),
    ]);
    widths.push(readFileSync((await download.path())!).readUInt32BE(16));
  }
  expect(widths[0]).toBeGreaterThanOrEqual(1080);
  expect(widths[1]).toBeGreaterThanOrEqual(1620);
  expect(widths[1]).toBeGreaterThan(widths[0]);
});

for (const [ratio, w, h] of [["Dọc 4:5", 4, 5], ["Story 9:16", 9, 16], ["Vuông 1:1", 1, 1]] as const) {
  test(`${ratio} with a 300-character message on a phone keeps its ratio in PNG and PDF`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await fillAll(page);
    await page.getByLabel("Lời mời").fill("Vui lòng đến dự ".repeat(19).slice(0, 300));
    await page.getByRole("radio", { name: ratio }).check();
    const card = page.getByRole("region", { name: "Xem trước thiệp" });
    const box = (await card.boundingBox())!;
    expect(Math.abs(box.width / box.height - w / h)).toBeLessThan(0.01);

    const [pngDownload] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Tải về" }).click(),
    ]);
    const png = readFileSync((await pngDownload.path())!);
    expect(Math.abs(png.readUInt32BE(16) / png.readUInt32BE(20) - w / h)).toBeLessThan(0.01);

    await page.getByRole("radio", { name: "PDF" }).check();
    const [pdfDownload] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Tải về" }).click(),
    ]);
    const pdf = readFileSync((await pdfDownload.path())!).toString("latin1");
    const [, pw, ph] = pdf.match(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/)!;
    expect(Math.abs(Number(pw) / Number(ph) - w / h)).toBeLessThan(0.01);
  });
}

test("the full-screen preview keeps the chosen ratio", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await fillAll(page);
  await page.getByRole("radio", { name: "Story 9:16" }).check();
  await page.getByRole("button", { name: "Xem trước" }).click();
  const box = await page.getByRole("dialog").locator("[style*='aspect-ratio']").boundingBox();
  expect(Math.abs(box!.width / box!.height - 9 / 16)).toBeLessThan(0.01);
});
