import { expect, test } from "@playwright/test";

test("registers, edits, filters and deletes a real private usage", async ({ page }) => {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;
  test.skip(!email || !password, "Dedicated E2E user credentials are not configured.");

  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email!);
  await page.getByRole("textbox", { name: "Senha" }).fill(password!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/diario?period=all");
  const register = page.getByRole("button", { name: "Registrar uso" }).first();
  test.skip(await register.isDisabled(), "The dedicated E2E user has no perfume yet.");

  await register.click();
  const dialog = page.getByRole("dialog", { name: "Registrar uso" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Tab");

  const perfumeSelect = dialog.getByRole("combobox", { name: "Fragrância" });
  await perfumeSelect.selectOption({ index: 1 });
  const perfumeName = (await perfumeSelect.locator("option:checked").textContent())?.split(" — ")[0];
  const note = `Fluxo E2E ${Date.now()}`;

  await dialog.getByRole("radio", { name: "Trabalho" }).check();
  await dialog.getByRole("radio", { name: "Manhã" }).check();
  await dialog.getByRole("radio", { name: "Fechado" }).check();
  await dialog.getByRole("radio", { name: "Zero elogios" }).check();
  await dialog.getByRole("radio", { name: "Satisfação 4 de 5" }).check();
  await dialog.getByLabel("Observação opcional").fill(note);
  await dialog.getByRole("button", { name: "Salvar uso" }).click();

  await expect(page.getByText(note)).toBeVisible();
  await expect(page.getByText("Nenhum elogio").first()).toBeVisible();

  const entry = page.getByRole("article").filter({ hasText: note });
  await entry.getByRole("button", { name: `Editar uso de ${perfumeName}` }).click();
  const editDialog = page.getByRole("dialog", { name: "Editar uso" });
  await editDialog.getByRole("radio", { name: "Satisfação 5 de 5" }).check();
  await editDialog.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(entry.getByText("Satisfação 5/5")).toBeVisible();

  await page.getByRole("link", { name: "Sem elogios" }).click();
  await expect(page.getByText(note)).toBeVisible();

  await page.setViewportSize({ width: 375, height: 812 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    ),
  ).toBe(false);

  await page
    .getByRole("article")
    .filter({ hasText: note })
    .getByRole("button", { name: `Excluir uso de ${perfumeName}` })
    .click();
  await page.getByRole("button", { name: "Confirmar exclusão" }).click();
  await expect(page.getByText(note)).toHaveCount(0);
});
