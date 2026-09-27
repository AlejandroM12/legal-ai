import { expect, test } from "@playwright/test";

test("login page is reachable", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
  await page.getByLabel("Email").fill("ana@example.com");
  await page.getByLabel("Contraseña").fill("secreto123");
  await expect(page.getByRole("button", { name: "Entrar" })).toBeEnabled();
});

test("register page is reachable", async ({ page }) => {
  await page.goto("/register");
  await expect(page.getByRole("heading", { name: "Crear cuenta" })).toBeVisible();
});
