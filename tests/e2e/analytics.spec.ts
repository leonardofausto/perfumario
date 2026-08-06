import { expect, test } from "@playwright/test";

test("filters real private analytics with keyboard and without mobile overflow", async ({
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

  await page.goto("/analises?period=30d&timezone=America%2FSao_Paulo");
  const empty = page.getByText("Seu diário ainda não tem usos");
  const sevenDays = page.getByRole("link", { name: "7 dias" });
  await expect(empty.or(sevenDays)).toBeVisible();
  test.skip(await empty.isVisible(), "The dedicated E2E user has no private usage data.");

  await sevenDays.click();
  await expect(page).toHaveURL(/period=7d/);

  const satisfaction = page.getByRole("button", { name: "Satisfação" });
  await satisfaction.focus();
  await page.keyboard.press("Enter");
  await expect(satisfaction).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { name: "Distribuição das notas" })).toBeVisible();

  await page.getByRole("button", { name: "Usos" }).click();
  const point = page.locator("g[role='img']").first();
  if (await point.isVisible()) {
    await point.focus();
    await expect(point).toBeFocused();
  }

  await page.setViewportSize({ width: 375, height: 812 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    ),
  ).toBe(false);
});
