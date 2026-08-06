import { expect, test } from "@playwright/test";

test("shows the authenticated overview, changes period and stays compact on mobile", async ({
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
  await expect(page.getByRole("heading", { level: 1, name: "Visão geral" })).toBeVisible();

  const emptyCollection = page.getByText("Sua estante começa na Minha estante");
  if (!(await emptyCollection.isVisible())) {
    await page.getByRole("link", { name: "7 dias" }).click();
    await expect(page).toHaveURL(/period=7d/);
    await expect(page.getByRole("link", { name: "Minha coleção" }).first()).toBeVisible();
    await expect(page.locator("form")).toHaveCount(0);
  } else {
    await expect(page.getByRole("link", { name: "Adicionar fragrância" })).toBeVisible();
  }

  await page.setViewportSize({ width: 375, height: 812 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    ),
  ).toBe(false);
});
