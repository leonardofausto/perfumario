import { expect, test } from "@playwright/test";

const viewports = [
  { height: 720, width: 320 },
  { height: 812, width: 375 },
  { height: 1024, width: 768 },
  { height: 900, width: 1024 },
  { height: 900, width: 1440 },
];

test("redirects a visitor without a session away from private routes", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("form", { name: "Entrar na sua estante" })).toBeVisible();
});

test("keeps the public login responsive at the supported widths", async ({ page }) => {
  await page.goto("/login");

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await expect(page.getByRole("heading", { name: "Entre na sua estante" })).toBeVisible();
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasOverflow, `overflow at ${viewport.width}px`).toBe(false);
  }
});

test("logs in, verifies the private shell, updates profile, restores it, and logs out", async ({
  page,
}) => {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;
  test.skip(!email || !password, "Dedicated E2E user credentials are not configured.");

  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email!);
  await page.getByRole("textbox", { name: "Senha" }).fill(password!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    page.getByRole("link", { exact: true, name: "Minha Coleção" })
  ).toBeVisible();

  await page.getByRole("button", { name: "Minha conta" }).click();
  await page.getByRole("menuitem", { name: "Editar perfil" }).click();
  await expect(page).toHaveURL(/\/perfil$/);

  const nameInput = page.getByLabel("Nome de exibição");
  const originalName = await nameInput.inputValue();
  const temporaryName = `Teste E2E ${Date.now()}`;
  await nameInput.fill(temporaryName);
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page.getByText("Perfil atualizado.")).toBeVisible();

  await nameInput.fill(originalName);
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page.getByText("Perfil atualizado.")).toBeVisible();

  await page.getByRole("button", { name: "Minha conta" }).click();
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/$/);
});
