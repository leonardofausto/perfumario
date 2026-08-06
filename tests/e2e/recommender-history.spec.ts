import { expect, test } from "@playwright/test";

test("reveals a Top 3 from the authenticated user's collection and history", async ({
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

  await page.goto("/recomendador");
  const emptyCollection = page.getByRole("heading", {
    name: "Sua coleção ainda não tem perfumes.",
  });
  const reveal = page.getByRole("button", { name: "Revelar meu Top 3" });
  test.skip(await reveal.isDisabled(), "The dedicated E2E user has no recommendation candidates.");

  const manualContextButton = page.getByRole("button", {
    name: "Ajustar contexto manualmente",
  });
  await manualContextButton.click();
  await expect(manualContextButton).toHaveAttribute("aria-expanded", "true");
  await page.getByLabel("Cidade").fill("Curitiba");
  await page.getByLabel("Temperatura").fill("18");
  await page.getByLabel("Clima").fill("Chuvoso");
  await page.getByRole("button", { name: "Usar contexto manual" }).click();

  await reveal.click();

  const topChoice = page.getByText("MELHOR ESCOLHA PARA AGORA");
  await expect(topChoice.or(emptyCollection)).toBeVisible();
  test.skip(
    await emptyCollection.isVisible(),
    "The dedicated E2E user has no recommendation candidates.",
  );
  await expect(topChoice).toBeVisible();
  await expect(page.getByText(/Compatibilidade: \d+%/).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Abrir detalhes" }).first()).toBeVisible();
  await expect(page.getByText(/undefined|NaN/)).toHaveCount(0);
});
