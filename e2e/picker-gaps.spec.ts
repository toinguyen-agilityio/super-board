import { expect, test } from "@playwright/test";

const templates = [
  { id: "co-dien", name: "Cổ điển" },
  { id: "hoa-dao", name: "Hoa đào" },
  { id: "toi-gian", name: "Tối giản" },
];

test("every card thumbnail actually loads", async ({ page }) => {
  await page.goto("/");
  const imgs = page.getByRole("link").getByRole("img");
  await expect(imgs).toHaveCount(3);
  for (const img of await imgs.all()) {
    await expect(img).toBeVisible();
    const loaded = await img.evaluate(
      (el: HTMLImageElement) => el.complete && el.naturalWidth > 0,
    );
    expect(loaded).toBe(true);
  }
});

for (const t of templates) {
  test(`clicking "${t.name}" opens /tao?mau=${t.id}`, async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link").filter({ hasText: t.name }).click();
    await expect(page).toHaveURL(`/tao?mau=${t.id}`);
    await expect(page.getByText(`Mẫu: ${t.name}`)).toBeVisible();
  });
}

test("missing mau redirects home", async ({ page }) => {
  await page.goto("/tao");
  await expect(page).toHaveURL("/");
});

test("repeated mau redirects home", async ({ page }) => {
  await page.goto("/tao?mau=co-dien&mau=hoa-dao");
  await expect(page).toHaveURL("/");
});
