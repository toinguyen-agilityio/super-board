import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

// QA gaps for #4: the PNG must match the preview (text, colours, font, background),
// and full screen must keep the customise choices, not only the typed text.

const preview = (page: Page) => page.getByRole("region", { name: "Xem trước thiệp" });

async function fillAll(page: Page) {
  await page.goto("/tao?mau=hoa-dao", { waitUntil: "networkidle" });
  await page.getByLabel("Tên cô dâu").fill("Nguyễn Thị Hằng");
  await page.getByLabel("Tên chú rể").fill("Trần Văn Đức");
  await page.getByLabel("Ngày giờ").fill("2026-12-20T18:00");
  await page.getByLabel("Địa điểm").fill("Hà Nội");
}

// A 40×40 PNG: left half yellow, right half light blue — easy to find in the export.
async function backgroundPng(page: Page) {
  const dataUrl = await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 40;
    c.height = 40;
    const g = c.getContext("2d")!;
    g.fillStyle = "#fff59d";
    g.fillRect(0, 0, 20, 40);
    g.fillStyle = "#b3e5fc";
    g.fillRect(20, 0, 20, 40);
    return c.toDataURL("image/png");
  });
  return Buffer.from(dataUrl.split(",")[1], "base64");
}

async function customise(page: Page, font: string) {
  await page.getByRole("radio", { name: "Đỏ son" }).check();
  await page.getByRole("radio", { name: font }).check();
  await page.getByLabel("Ảnh nền").setInputFiles({ name: "nen.png", mimeType: "image/png", buffer: await backgroundPng(page) });
  await expect.poll(() => preview(page).evaluate((el) => getComputedStyle(el).backgroundImage)).toContain("blob:");
  await page.evaluate(() => document.fonts.ready);
}

async function downloadPng(page: Page) {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Tải về" }).click(),
  ]);
  return readFileSync((await download.path())!);
}

// Mean per-channel difference (0–255) between two PNGs, both scaled to the smaller one's size.
async function meanDiff(page: Page, a: Buffer, b: Buffer) {
  return page.evaluate(
    async ([a64, b64]) => {
      const load = (s: string) =>
        new Promise<HTMLImageElement>((ok, fail) => {
          const img = new Image();
          img.onload = () => ok(img);
          img.onerror = fail;
          img.src = `data:image/png;base64,${s}`;
        });
      const [ia, ib] = await Promise.all([load(a64), load(b64)]);
      const w = Math.min(ia.width, ib.width);
      const h = Math.min(ia.height, ib.height);
      const px = (img: HTMLImageElement) => {
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const g = c.getContext("2d")!;
        g.drawImage(img, 0, 0, w, h);
        return g.getImageData(0, 0, w, h).data;
      };
      const [pa, pb] = [px(ia), px(ib)];
      let sum = 0;
      for (let i = 0; i < pa.length; i += 4) {
        sum += Math.abs(pa[i] - pb[i]) + Math.abs(pa[i + 1] - pb[i + 1]) + Math.abs(pa[i + 2] - pb[i + 2]);
      }
      return sum / ((pa.length / 4) * 3);
    },
    [a.toString("base64"), b.toString("base64")] as const,
  );
}

test("the PNG matches the preview: text, palette, font and uploaded background", async ({ page }, info) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await fillAll(page);
  await customise(page, "Dancing Script");

  const shot = await preview(page).screenshot();
  const png = await downloadPng(page);
  await info.attach("preview.png", { body: shot, contentType: "image/png" });
  await info.attach("export.png", { body: png, contentType: "image/png" });
  // QA_EVIDENCE=<dir> keeps both images for the QA report.
  if (process.env.QA_EVIDENCE) {
    mkdirSync(process.env.QA_EVIDENCE, { recursive: true });
    writeFileSync(`${process.env.QA_EVIDENCE}/ac3-preview.png`, shot);
    writeFileSync(`${process.env.QA_EVIDENCE}/ac3-export.png`, png);
  }

  expect(png.readUInt32BE(16)).toBeGreaterThanOrEqual(1080);
  // Same aspect ratio as the on-screen preview (within 2 %).
  const box = (await preview(page).boundingBox())!;
  const ratio = png.readUInt32BE(16) / png.readUInt32BE(20);
  expect(Math.abs(ratio - box.width / box.height) / (box.width / box.height)).toBeLessThan(0.02);

  const same = await meanDiff(page, shot, png);

  // Control: the same invitation in another font must look clearly further away,
  // so the threshold below really catches a dropped web font.
  await page.getByRole("radio", { name: "Be Vietnam Pro" }).check();
  await page.evaluate(() => document.fonts.ready);
  const otherFont = await preview(page).screenshot();
  const control = await meanDiff(page, otherFont, png);

  // Control: without the background the export would be mostly white.
  const white = await page.evaluate(async () => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 64;
    const g = c.getContext("2d")!;
    g.fillStyle = "#fff";
    g.fillRect(0, 0, 64, 64);
    return c.toDataURL("image/png").split(",")[1];
  });
  const noBackground = await meanDiff(page, Buffer.from(white, "base64"), png);

  expect(same).toBeLessThan(control);
  expect(same).toBeLessThan(6);
  expect(noBackground).toBeGreaterThan(8);
});

test("full screen keeps palette, font and background, and shows them", async ({ page }) => {
  await fillAll(page);
  await customise(page, "Playfair Display");
  const before = await preview(page).evaluate((el) => {
    const s = getComputedStyle(el);
    return { color: s.color, font: s.fontFamily, bg: s.backgroundImage };
  });

  await page.getByRole("button", { name: "Xem trước" }).click();
  const dialog = page.getByRole("dialog", { name: "Xem trước toàn màn hình" });
  const card = dialog.locator("div").filter({ hasText: "Trân trọng báo tin" }).last();
  const inDialog = await card.evaluate((el) => {
    const s = getComputedStyle(el);
    return { color: s.color, font: s.fontFamily, bg: s.backgroundImage };
  });
  expect(inDialog).toEqual(before);
  await expect(dialog).toContainText("Nguyễn Thị Hằng");
  await expect(dialog).toContainText("Hà Nội");

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("radio", { name: "Đỏ son" })).toBeChecked();
  await expect(page.getByRole("radio", { name: "Playfair Display" })).toBeChecked();
  expect(await preview(page).evaluate((el) => getComputedStyle(el).backgroundImage)).toBe(before.bg);
  await expect(page.getByRole("button", { name: "Xem trước" })).toBeFocused();
});

test("Tải về stays disabled while a required field is only spaces; hint is in Vietnamese", async ({ page }) => {
  await fillAll(page);
  const download = page.getByRole("button", { name: "Tải về" });
  await expect(download).toBeEnabled();
  for (const label of ["Tên cô dâu", "Tên chú rể", "Địa điểm"]) {
    const field = page.getByLabel(label);
    const value = await field.inputValue();
    await field.fill("   ");
    await expect(download).toBeDisabled();
    await expect(page.locator("#download-hint")).toHaveText(
      "Hãy điền đủ tên cô dâu, tên chú rể, ngày giờ và địa điểm để tải thiệp",
    );
    await field.fill(value);
    await expect(download).toBeEnabled();
  }
  await page.getByLabel("Ngày giờ").fill("");
  await expect(download).toBeDisabled();
});

// RED on 9ed46b6: the preview has no background colour of its own (it shows the page's white),
// so the exported PNG is transparent and turns black in a dark-mode viewer (Zalo, Photos).
test("with no uploaded background the PNG is opaque white, as the preview looks", async ({ page }) => {
  await fillAll(page);
  const png = await downloadPng(page);
  const pixels = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const g = c.getContext("2d")!;
    g.drawImage(img, 0, 0);
    const at = (x: number, y: number) => Array.from(g.getImageData(x, y, 1, 1).data);
    return [at(40, Math.floor(img.height / 2)), at(Math.floor(img.width / 2), 10)];
  }, png.toString("base64"));
  for (const px of pixels) expect(px).toEqual([255, 255, 255, 255]);
});
