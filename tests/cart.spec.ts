import { test, expect } from "@playwright/test";

async function addToCartAndGoTo(
  page: import("@playwright/test").Page,
  target: string
) {
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
  await page.goto(target);
  // Wait for client hydration to load cart from localStorage
  await page.waitForLoadState("networkidle");
}

test.describe("Cart Page", () => {
  test("empty cart shows empty state", async ({ page }) => {
    await page.goto("/carrinho");
    await expect(page.getByText("Seu carrinho está vazio")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Ver produtos/i })
    ).toBeVisible();
  });

  test("cart shows items after adding product", async ({ page }) => {
    await addToCartAndGoTo(page, "/carrinho");
    await expect(page.getByText("Porta Celulares")).toBeVisible();
    await expect(page.getByText("R$ 34,90").first()).toBeVisible();
  });

  test("quantity can be changed in cart", async ({ page }) => {
    await addToCartAndGoTo(page, "/carrinho");
    const plus = page.getByRole("button", { name: "+", exact: true }).first();
    await plus.click();
    await expect(
      page.locator("span.text-center.text-sm.font-bold").first()
    ).toHaveText("2");
  });

  test("remove item from cart", async ({ page }) => {
    await addToCartAndGoTo(page, "/carrinho");
    const removeBtn = page.getByRole("button", { name: "Remover" }).first();
    await removeBtn.click();
    await expect(page.getByText("Seu carrinho está vazio")).toBeVisible();
  });
});
