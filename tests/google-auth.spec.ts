import { test, expect } from "@playwright/test";

test.describe("Google OAuth - Login Page", () => {
  test("renders Google login button", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(
      page.getByRole("button", { name: "Entrar com Google" })
    ).toBeVisible();
  });

  test("Google button shows loading state on click", async ({ page }) => {
    await page.goto("/auth/login");
    const googleBtn = page.getByRole("button", { name: "Entrar com Google" });
    await googleBtn.click();
    await expect(
      page.getByRole("button", { name: "Redirecionando..." })
    ).toBeVisible();
  });

  test("shows error message when callback has error param", async ({
    page,
  }) => {
    await page.goto("/auth/login?error=auth_failed");
    await expect(
      page.getByText("Falha na autenticação. Tente novamente.")
    ).toBeVisible();
  });

  test("shows generic error for unknown error param", async ({ page }) => {
    await page.goto("/auth/login?error=unknown_error");
    await expect(
      page.getByText("Erro ao autenticar. Tente novamente.")
    ).toBeVisible();
  });
});

test.describe("Google OAuth - Register Page", () => {
  test("renders Google register button", async ({ page }) => {
    await page.goto("/auth/register");
    await expect(
      page.getByRole("button", { name: "Cadastrar com Google" })
    ).toBeVisible();
  });

  test("Google button shows loading state on click", async ({ page }) => {
    await page.goto("/auth/register");
    const googleBtn = page.getByRole("button", {
      name: "Cadastrar com Google",
    });
    await googleBtn.click();
    await expect(
      page.getByRole("button", { name: "Redirecionando..." })
    ).toBeVisible();
  });

  test("shows error message when callback has error param", async ({
    page,
  }) => {
    await page.goto("/auth/register?error=auth_failed");
    await expect(
      page.getByText("Falha na autenticação. Tente novamente.")
    ).toBeVisible();
  });

  test("shows generic error for unknown error param", async ({ page }) => {
    await page.goto("/auth/register?error=oauth_denied");
    await expect(
      page.getByText("Acesso ao Google foi negado. Tente novamente.")
    ).toBeVisible();
  });
});

test.describe("Auth Callback Route", () => {
  test("redirects to login with error when no code provided", async ({
    page,
  }) => {
    await page.goto("/auth/callback");
    await expect(page).toHaveURL(/\/auth\/login\?error=auth_failed/);
  });

  test("redirects to login with error for invalid code", async ({ page }) => {
    await page.goto("/auth/callback?code=invalid_code_12345");
    await expect(page).toHaveURL(/\/auth\/login\?error=auth_failed/);
  });
});

test.describe("Checkout Auth Guard", () => {
  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
