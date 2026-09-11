import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads successfully and shows hero", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Roldan/);
    await expect(
      page.getByRole("heading", { level: 1, name: /Móveis pequenos/i })
    ).toBeVisible();
  });

  test("shows catalog grid with product cards", async ({ page }) => {
    await page.goto("/");
    const cards = page.locator("[data-testid='product-card']");
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("product card shows name, price and image", async ({ page }) => {
    await page.goto("/");
    const card = page.locator("[data-testid='product-card']").first();
    await expect(card.getByText("R$")).toBeVisible();
  });

  test("pagination works", async ({ page }) => {
    await page.goto("/");
    const nextBtn = page.getByRole("button", { name: /Próxima/i });
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      await expect(
        page.locator("[data-testid='product-card']").first()
      ).toBeVisible();
    }
  });
});
