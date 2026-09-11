import { test, expect } from "@playwright/test";

test.describe("Profile Page", () => {
  test("unauthenticated user redirects to login", async ({ page }) => {
    await page.goto("/perfil");
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
