import { test, expect } from "@playwright/test";

test.describe("Product Detail Page", () => {
  test("loads product page with all sections", async ({ page }) => {
    await page.goto("/produto/porta-celulares");
    await expect(
      page.getByRole("heading", { level: 1, name: /Porta Celulares/i })
    ).toBeVisible();
    await expect(page.getByText("R$ 34,90")).toBeVisible();
    await expect(page.getByText("Especificações")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Adicionar ao carrinho", exact: true })
    ).toBeVisible();
  });

  test("quantity selector works", async ({ page }) => {
    await page.goto("/produto/porta-celulares");
    const minus = page.getByRole("button", { name: "−", exact: true });
    const plus = page.getByRole("button", { name: "+", exact: true });
    const qtyInput = page.locator("input[type='number']");

    await plus.click();
    await expect(qtyInput).toHaveValue("2");
    await plus.click();
    await expect(qtyInput).toHaveValue("3");
    await minus.click();
    await expect(qtyInput).toHaveValue("2");
  });

  test("cross-sell section shows related products", async ({ page }) => {
    await page.goto("/produto/porta-celulares");
    await expect(page.getByText("Compre junto com")).toBeVisible();
    const crossSellCards = page.locator("[data-testid='cross-sell-card']");
    const count = await crossSellCards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("add to cart works", async ({ page }) => {
    await page.goto("/produto/porta-celulares");
    await page
      .getByRole("button", { name: "Adicionar ao carrinho", exact: true })
      .click();
    // Wait for localStorage to be written
    await expect
      .poll(
        async () => {
          return await page.evaluate(() => {
            const data = localStorage.getItem("roldan-cart");
            return data ? JSON.parse(data).length > 0 : false;
          });
        },
        { timeout: 5000 }
      )
      .toBe(true);
    await page.goto("/carrinho");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Porta Celulares")).toBeVisible();
    await expect(page.getByText("R$ 34,90").first()).toBeVisible();
  });
});
