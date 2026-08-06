import { expect, test, type Page } from "@playwright/test";

const emptyMetrics = {
  fixacao: null,
  projecao: null,
  rastro: null,
  versatilidade: null,
  presenca: null,
  intensity: null,
  sweetness: null,
  freshness: null,
  elegance: null,
  sensuality: null,
  primavera: null,
  verao: null,
  outono: null,
  inverno: null,
  ar_livre: null,
  casual: null,
  encontro: null,
  festa: null,
  formal: null,
  trabalho: null,
  manha: null,
  tarde: null,
  noite: null,
  madrugada: null,
  fechado: null,
};

function field<T>(value: T | null) {
  return {
    value,
    confidence: value === null ? 0 : 0.9,
    origin: value === null ? "unavailable" : "official",
    sources: value === null ? [] : ["official"],
    conflicts: [],
    inferred: false,
  };
}

const response = {
  status: "success",
  result: {
    query: { name: "Fakhar Black", brand: "Lattafa" },
    fields: {
      name: field("Fakhar Black"),
      brand: field("Lattafa"),
      description: field("Fragrância aromática amadeirada."),
      concentration: field("eau_de_parfum"),
      categoryType: field("arabe"),
      audience: field("masculine"),
      launchYear: field(2022),
      inspirationKind: field("inspiration"),
      inspiredBy: field("Y Eau de Parfum"),
      olfactoryFamilies: field(["Aromático"]),
      pyramid: field({
        top: "Maçã - Bergamota",
        heart: "Lavanda - Sálvia",
        base: "Cedro - Fava tonka",
      }),
      accords: field("Aromático: 90"),
      metrics: field({ ...emptyMetrics, fixacao: 82 }),
    },
    sources: [
      {
        id: "official",
        kind: "official",
        title: "Lattafa",
        url: "https://lattafa.com/fakhar-black",
      },
    ],
    confidence: 0.9,
    explanation: "Resultado consistente.",
    warnings: [],
  },
};

async function login(page: Page) {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;
  test.skip(!email || !password, "Dedicated E2E user credentials are not configured.");

  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email!);
  await page.getByRole("textbox", { name: "Senha" }).fill(password!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("previews and applies autofill to a new perfume without saving", async ({ page }) => {
  test.skip(
    process.env.NEXT_PUBLIC_PERFUME_AUTOFILL_VISIBLE !== "true",
    "Perfume autofill is intentionally hidden.",
  );
  await login(page);
  await page.route("**/api/perfumes/autofill", (route) =>
    route.fulfill({ json: response, status: 200 }),
  );
  await page.goto("/colecao/novo");

  await page.getByLabel("Nome do perfume").fill("Fakhar Black");
  await page.getByLabel("Marca").fill("Lattafa");
  await expect(page.getByLabel("Formato na estante")).toHaveValue("");
  await page.getByRole("button", { name: "Buscar dados" }).click();
  await expect(page.getByText(/Inspiração · Y Eau de Parfum/)).toBeVisible();
  await expect(page.getByLabel("Explicativo do perfume")).toHaveValue("");

  await page.getByRole("button", { name: "Aplicar ao cadastro" }).click();
  await expect(page.getByLabel("Explicativo do perfume")).toHaveValue(
    "Fragrância aromática amadeirada.",
  );
  await expect(page.getByLabel("Perfume de referência")).toHaveValue(
    "Y Eau de Parfum",
  );
  await expect(page.getByLabel("Formato na estante")).toHaveValue("");

  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasOverflow, `overflow at ${width}px`).toBe(false);
  }
});

test("keeps edit data until a researched difference is selected", async ({ page }) => {
  test.skip(
    process.env.NEXT_PUBLIC_PERFUME_AUTOFILL_VISIBLE !== "true",
    "Perfume autofill is intentionally hidden.",
  );
  const perfumeId = process.env.E2E_PERFUME_ID;
  test.skip(!perfumeId, "E2E_PERFUME_ID is not configured.");
  await login(page);
  await page.route("**/api/perfumes/autofill", (route) =>
    route.fulfill({ json: response, status: 200 }),
  );
  await page.goto(`/colecao/${perfumeId}/editar`);

  const currentDescription = await page.getByLabel("Explicativo do perfume").inputValue();
  await page.getByRole("button", { name: "Buscar dados" }).click();
  await expect(page.getByText("Fragrância aromática amadeirada.")).toBeVisible();
  await expect(page.getByLabel("Explicativo do perfume")).toHaveValue(
    currentDescription,
  );

  await page.getByRole("checkbox", { name: /Descrição/ }).check();
  await page.getByRole("button", { name: "Aplicar selecionados" }).click();
  await expect(page.getByLabel("Explicativo do perfume")).toHaveValue(
    "Fragrância aromática amadeirada.",
  );
});
