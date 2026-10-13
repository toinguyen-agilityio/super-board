import { expect, test, type Page } from "@playwright/test";

const preview = (page: Page) => page.getByRole("region", { name: "Xem trước thiệp" });

async function open(page: Page) {
  await page.goto("/tao?mau=hoa-dao", { waitUntil: "networkidle" });
  await expect(preview(page)).toBeVisible();
}

for (const font of ["Be Vietnam Pro", "Playfair Display", "Dancing Script"]) {
  test(`${font} renders Vietnamese diacritics from its own web font`, async ({ page }) => {
    await open(page);
    await page.getByLabel("Tên cô dâu").fill("Nguyễn Thị Hằng");
    await page.getByRole("radio", { name: font }).check();
    const name = preview(page).getByText("Nguyễn Thị Hằng");
    await expect(name).toBeVisible();
    // The first family in the computed stack is the next/font face; it must load and cover "ễ ị ằ".
    const covered = await name.evaluate(async (el) => {
      const family = getComputedStyle(el).fontFamily.split(",")[0].trim();
      await document.fonts.load(`16px ${family}`, el.textContent!);
      return document.fonts.check(`16px ${family}`, el.textContent!) &&
        [...document.fonts].some(
          (f) => f.status === "loaded" && `"${f.family.replace(/"/g, "")}"` === family.replace(/'/g, '"'),
        );
    });
    expect(covered).toBe(true);
  });
}

test("a palette recolours the preview names", async ({ page }) => {
  await open(page);
  const names = preview(page).locator("p.text-2xl");
  const before = await names.evaluate((el) => getComputedStyle(el).color);
  await page.getByRole("radio", { name: "Xanh ngọc" }).check();
  await expect(names).toHaveCSS("color", "rgb(0, 121, 107)");
  expect(before).not.toBe("rgb(0, 121, 107)");
});
