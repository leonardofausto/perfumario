import { expect, test } from "@playwright/test";

test.setTimeout(120_000);

const viewports = [
  { width: 320, height: 720 },
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
] as const;

const modules = [
  ["/dashboard", "Visão geral"],
  ["/diario", "Diário de uso"],
  ["/analises", "Análises"],
  ["/recomendador", "Recomendador"],
] as const;

test("keeps Phase 3 modules readable and free from horizontal overflow", async ({ page }) => {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;
  test.skip(!email || !password, "Dedicated E2E user credentials are not configured.");

  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email!);
  await page.getByRole("textbox", { name: "Senha" }).fill(password!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);

    for (const [path, title] of modules) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        ),
        `${title} must fit at ${viewport.width}px`,
      ).toBe(false);
    }
  }
});

test("honors reduced motion and exposes keyboard focus", async ({ page }) => {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;
  test.skip(!email || !password, "Dedicated E2E user credentials are not configured.");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email!);
  await page.getByRole("textbox", { name: "Senha" }).fill(password!);
  await page.getByRole("button", { name: "Entrar" }).click();

  expect(
    await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches),
  ).toBe(true);

  const firstNavigationLink = page.getByRole("link", { name: "Visão geral" }).first();
  for (let tab = 0; tab < 10; tab += 1) {
    await page.keyboard.press("Tab");
    if (await firstNavigationLink.evaluate((element) => document.activeElement === element)) {
      break;
    }
  }
  await expect(firstNavigationLink).toBeFocused();
  expect(await firstNavigationLink.evaluate((element) => getComputedStyle(element).outlineStyle))
    .not.toBe("none");
});
