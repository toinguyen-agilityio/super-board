import { expect, test } from "@playwright/test";

test("picks a template and opens the editor", async ({ page }) => {
  await page.goto("/");
  const cards = page.getByRole("link");
  await expect(cards).toHaveCount(3);
  await cards.filter({ hasText: "Hoa đào" }).click();
  await expect(page).toHaveURL("/tao?mau=hoa-dao");
  await expect(page.getByRole("heading", { name: "Tạo thiệp cưới" })).toBeVisible();
  await expect(page.getByText("Mẫu: Hoa đào")).toBeVisible();
});

test("unknown template redirects home", async ({ page }) => {
  await page.goto("/tao?mau=khong-co");
  await expect(page).toHaveURL("/");
});

test("cards stack in one column at 375 px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  const boxes = await Promise.all(
    (await page.getByRole("link").all()).map((c) => c.boundingBox()),
  );
  expect(new Set(boxes.map((b) => b!.x)).size).toBe(1);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});
