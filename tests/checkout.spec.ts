import { test, expect } from "@playwright/test";

test.describe("Checkout Page", () => {
  test("empty cart shows empty state", async ({ page }) => {
    await page.goto("/checkout");
    await expect(
      page.getByText(/carrinho vazio|adicione itens/i)
    ).toBeVisible();
  });

  test("checkout with items shows form", async ({ page }) => {
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
    await page.goto("/checkout");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Porta Celulares")).toBeVisible();
    await expect(page.getByText("Resumo do Pedido")).toBeVisible();
  });
});
