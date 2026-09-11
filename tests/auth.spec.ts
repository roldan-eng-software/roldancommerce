import { test, expect } from "@playwright/test";

test.describe("Auth Pages", () => {
  test("login page loads with form", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(
      page.getByRole("heading", { level: 1, name: /Entrar/i })
    ).toBeVisible();
    await expect(page.getByLabel(/e-?mail/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Entrar", exact: true })
    ).toBeVisible();
  });

  test("register page loads with form", async ({ page }) => {
    await page.goto("/auth/register");
    await expect(
      page.getByRole("heading", { level: 1, name: /Criar conta/i })
    ).toBeVisible();
    await expect(page.getByLabel(/e-?mail/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Criar conta", exact: true })
    ).toBeVisible();
  });

  test("login shows validation errors on empty submit", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await expect(page.getByText("E-mail inválido")).toBeVisible();
    await expect(
      page.getByText("Senha deve ter no mínimo 6 caracteres")
    ).toBeVisible();
  });

  test("register shows validation errors on empty submit", async ({ page }) => {
    await page.goto("/auth/register");
    await page
      .getByRole("button", { name: "Criar conta", exact: true })
      .click();
    await expect(page.getByText("E-mail inválido")).toBeVisible();
    await expect(
      page.getByText("Senha deve ter no mínimo 6 caracteres")
    ).toBeVisible();
  });

  test("login link works from register page", async ({ page }) => {
    await page.goto("/auth/register");
    await page.getByRole("main").getByRole("link", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("register link works from login page", async ({ page }) => {
    await page.goto("/auth/login");
    await page
      .getByRole("main")
      .getByRole("link", { name: /Criar conta/i })
      .click();
    await expect(page).toHaveURL(/\/auth\/register/);
  });
});
