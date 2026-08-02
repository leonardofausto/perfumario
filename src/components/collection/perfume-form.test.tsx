import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/perfumes/actions", () => ({
  createPerfumeAction: vi.fn().mockResolvedValue({ status: "idle" }),
  updatePerfumeAction: vi.fn().mockResolvedValue({ status: "idle" }),
}));

import type { PerfumeDetail } from "@/features/perfumes/types";
import { createPerfumeAction, updatePerfumeAction } from "@/features/perfumes/actions";

import { PerfumeForm } from "./perfume-form";

const perfume: PerfumeDetail = {
  id: "owned",
  brand: "Natura",
  name: "Essencial",
  description: "Descrição existente",
  concentration: "eau_de_parfum",
  bottleFormat: "decant",
  inspirationKind: "inspiration",
  inspiredBy: "Referencia",
  olfactoryFamilies: ["Amadeirado"],
  imageUrl: null,
  imagePath: null,
  imageSourceUrl: null,
  descriptionSourceUrls: [],
  isFavorite: false,
  launchYear: 2024,
  categoryType: "designer",
  audience: "unisex",
  intensity: 88,
  sweetness: null,
  freshness: 0,
  elegance: 70,
  sensuality: 65,
  profileTags: ["Assinatura"],
  notes: { top: ["Limao"], heart: ["Cedro"], base: ["Ambar"] },
  scores: [{ category: "performance", metricKey: "fixacao", score: 80 }],
  createdAt: "2026-07-26T10:00:00.000Z",
  updatedAt: "2026-07-26T10:00:00.000Z",
};

function autofillField<T>(value: T | null) {
  return {
    value,
    confidence: value === null ? 0 : 0.9,
    origin: value === null ? "unavailable" : "official",
    sources: value === null ? [] : ["official"],
    conflicts: [],
    inferred: false,
  };
}

function autofillResult(overrides: Record<string, unknown> = {}) {
  const fields = {
    name: autofillField("Fakhar Black"),
    brand: autofillField("Lattafa"),
    description: autofillField("Descrição encontrada"),
    concentration: autofillField("eau_de_parfum"),
    categoryType: autofillField("arabe"),
    audience: autofillField("masculine"),
    launchYear: autofillField(2022),
    inspirationKind: autofillField("inspiration"),
    inspiredBy: autofillField("Y Eau de Parfum"),
    olfactoryFamilies: autofillField(["Aromático"]),
    pyramid: autofillField({
      top: "Maçã - Bergamota",
      heart: "Lavanda - Sálvia",
      base: "Cedro - Fava tonka",
    }),
    accords: autofillField("Aromático: 90"),
    metrics: autofillField(null),
    ...overrides,
  };
  return {
    status: "success",
    result: {
      query: { name: "Fakhar Black", brand: "Lattafa" },
      fields,
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
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(createPerfumeAction).mockClear();
  vi.mocked(updatePerfumeAction).mockClear();
});

describe("PerfumeForm", () => {
  it("applies researched fields to a new editable form without image, format, or autosave", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(autofillResult()), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    render(<PerfumeForm />);

    const image = new File(["cover"], "cover.webp", { type: "image/webp" });
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:cover"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
    fireEvent.change(screen.getByLabelText("Imagem do perfume"), {
      target: { files: [image] },
    });
    fireEvent.change(screen.getByLabelText("Nome do perfume"), {
      target: { value: "Fakhar Black" },
    });
    fireEvent.change(screen.getByLabelText("Marca"), {
      target: { value: "Lattafa" },
    });
    await user.click(screen.getByRole("button", { name: "Buscar dados" }));
    await user.click(
      await screen.findByRole("button", { name: "Aplicar ao cadastro" }),
    );

    expect(screen.getByLabelText("Nome do perfume")).toHaveValue("Fakhar Black");
    expect(screen.getByLabelText("Explicativo do perfume")).toHaveValue(
      "Descrição encontrada",
    );
    expect(screen.getByLabelText("Relação com outra fragrância")).toHaveValue(
      "inspiration",
    );
    expect(screen.getByLabelText("Perfume de referência")).toHaveValue(
      "Y Eau de Parfum",
    );
    expect(screen.getByLabelText("Formato na estante")).toHaveValue("");
    expect(
      (screen.getByLabelText("Imagem do perfume") as HTMLInputElement).files?.[0],
    ).toBe(image);
    expect(createPerfumeAction).not.toHaveBeenCalled();
    expect(updatePerfumeAction).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Explicativo do perfume"), {
      target: { value: "Editada" },
    });
    expect(screen.getByLabelText("Explicativo do perfume")).toHaveValue("Editada");
  });

  it("preserves edit data until selected fields are explicitly applied", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify(
            autofillResult({
              name: autofillField(perfume.name),
              brand: autofillField("Marca encontrada"),
              description: autofillField("Descrição nova"),
            }),
          ),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    render(<PerfumeForm perfume={perfume} />);

    await user.click(screen.getByRole("button", { name: "Buscar dados" }));
    expect(await screen.findByText("Descrição nova")).toBeInTheDocument();
    expect(screen.getByLabelText("Marca")).toHaveValue("Natura");
    expect(screen.getByLabelText("Explicativo do perfume")).toHaveValue(
      "Descrição existente",
    );
    expect(screen.getByLabelText("Formato na estante")).toHaveValue("decant");

    await user.click(screen.getByRole("checkbox", { name: /Descrição/ }));
    await user.click(screen.getByRole("button", { name: "Aplicar selecionados" }));

    expect(screen.getByLabelText("Marca")).toHaveValue("Natura");
    expect(screen.getByLabelText("Explicativo do perfume")).toHaveValue(
      "Descrição nova",
    );
    expect(screen.getByLabelText("Formato na estante")).toHaveValue("decant");
    expect(updatePerfumeAction).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText("Explicativo do perfume"));
    await user.type(screen.getByLabelText("Explicativo do perfume"), "Manual");
    expect(screen.getByLabelText("Explicativo do perfume")).toHaveValue("Manual");
  });

  it("applies relation and reference atomically when an edit becomes original", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify(
            autofillResult({
              name: autofillField(perfume.name),
              brand: autofillField(perfume.brand),
              inspirationKind: autofillField("original"),
              inspiredBy: autofillField(null),
            }),
          ),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    render(<PerfumeForm perfume={perfume} />);

    await user.click(screen.getByRole("button", { name: "Buscar dados" }));
    await user.click(
      await screen.findByRole("checkbox", { name: /Relação e referência/ }),
    );
    await user.click(screen.getByRole("button", { name: "Aplicar selecionados" }));

    expect(screen.getByLabelText("Relação com outra fragrância")).toHaveValue(
      "original",
    );
    expect(screen.getByLabelText("Perfume de referência")).toHaveValue("");
    expect(screen.getByLabelText("Perfume de referência")).toHaveAttribute(
      "readonly",
    );
    expect(updatePerfumeAction).not.toHaveBeenCalled();
  });

  it("renders blank create defaults and compact edit sections", () => {
    render(<PerfumeForm />);

    expect(screen.getByText("Novo cadastro")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Fragrância" })).toBeInTheDocument();
    expect(screen.getByLabelText("Marca")).toHaveValue("");
    expect(screen.getByLabelText("Concentração")).toHaveValue("unknown");
    expect(screen.getByLabelText("Formato na estante")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Descrição da fragrância" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Desempenho" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Quando usar" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Perfil sensorial" })).toBeInTheDocument();
    expect(screen.getByLabelText("Imagem do perfume")).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Secoes da ficha" })).not.toBeInTheDocument();
    expect(screen.queryByText("Imagem, revisao e acoes")).not.toBeInTheDocument();
    expect(screen.queryByText("Sem capa enviada")).not.toBeInTheDocument();
    expect(screen.queryByText("Clique para escolher")).not.toBeInTheDocument();
    expect(screen.getByText("Clique para mudar")).toBeInTheDocument();
    expect(screen.getByText("JPG, PNG, AVIF ou WebP")).toBeInTheDocument();
    expect(screen.getByText("máximo de 5 MB.")).toBeInTheDocument();
  });

  it("does not block unknown identity fields with browser-required inputs", () => {
    render(<PerfumeForm />);

    expect(screen.getByLabelText("Marca")).not.toBeRequired();
    expect(screen.getByLabelText("Nome do perfume")).not.toBeRequired();
  });

  it("loads edit values and keeps bottle format independent from concentration", () => {
    render(<PerfumeForm perfume={perfume} />);

    expect(screen.getByText("Editar cadastro")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Fragrância" })).toBeInTheDocument();
    expect(screen.getByLabelText("Marca")).toHaveValue("Natura");
    expect(screen.getByLabelText("Concentração")).toHaveValue("eau_de_parfum");
    expect(
      within(screen.getByLabelText("Concentração"))
        .getAllByRole("option")
        .map((option) => option.textContent),
    ).toEqual([
      "Não informado",
      "Body Splash",
      "Eau de Cologne (EDC)",
      "Eau de Parfum (EDP)",
      "Eau de Toilette (EDT)",
      "Óleo Perfumado",
      "Parfum",
    ]);
    expect(screen.getByLabelText("Formato na estante")).toHaveValue("decant");
    expect(
      within(screen.getByLabelText("Formato na estante"))
        .getAllByRole("option")
        .map((option) => option.textContent),
    ).toEqual(["Decant", "Frasco"]);
    expect(screen.getByLabelText("Notas de saída")).toHaveValue("Limao");
    expect(screen.getByLabelText("Fixação (%)")).toHaveValue(80);
    expect(screen.getByLabelText("Ano de lançamento")).toHaveValue(2024);
    expect(screen.getByLabelText("Ano de lançamento")).toHaveAttribute(
      "inputmode",
      "numeric",
    );
    expect(screen.getByLabelText("Ano de lançamento")).toHaveAttribute(
      "autocomplete",
      "off",
    );
    expect(screen.getByLabelText("Marca")).toHaveAttribute("autocomplete", "off");
    expect(screen.getByLabelText("Nome do perfume")).toHaveAttribute("autocomplete", "off");
    expect(screen.getByLabelText("Categoria")).toHaveValue("designer");
    expect(
      within(screen.getByLabelText("Categoria")).getAllByRole("option").map((option) => option.textContent),
    ).toEqual(["Não informado", "Árabe", "Designer", "Importado", "Nacional", "Nicho"]);
    expect(screen.getByLabelText("Público")).toHaveValue("unisex");
    expect(
      within(screen.getByLabelText("Público"))
        .getAllByRole("option")
        .map((option) => option.textContent),
    ).toEqual(["Não informado", "Feminino", "Masculino", "Unissex"]);
    expect(screen.getByLabelText("Intensidade (%)")).toHaveValue(88);
    expect(screen.getByLabelText("Frescor (%)")).toHaveValue(0);
    expect(screen.queryByText("Assinatura")).not.toBeInTheDocument();
    expect(screen.queryByText("Imagem, revisao e acoes")).not.toBeInTheDocument();
    expect(screen.getByText("Identidade e apresentação")).toBeInTheDocument();
    expect(screen.getByText("Descrição da fragrância")).toBeInTheDocument();
  });

  it("keeps the reference field visible and editable only for dupe or inspiration", () => {
    render(<PerfumeForm />);

    expect(screen.getByLabelText("Perfume de referência")).toHaveAttribute("readonly");
    fireEvent.change(screen.getByLabelText("Relação com outra fragrância"), {
      target: { value: "inspiration" },
    });
    expect(screen.getByLabelText("Perfume de referência")).toHaveValue("");
    expect(screen.getByLabelText("Perfume de referência")).not.toHaveAttribute("readonly");
    fireEvent.change(screen.getByLabelText("Relação com outra fragrância"), {
      target: { value: "original" },
    });
    expect(screen.getByLabelText("Perfume de referência")).toHaveAttribute("readonly");
    fireEvent.change(screen.getByLabelText("Relação com outra fragrância"), {
      target: { value: "dupe" },
    });
    expect(screen.getByLabelText("Perfume de referência")).not.toBeRequired();
    expect(screen.getByLabelText("Perfume de referência")).not.toHaveAttribute("readonly");
    fireEvent.change(screen.getByLabelText("Perfume de referência"), {
      target: { value: "Referencia salva" },
    });
    fireEvent.change(screen.getByLabelText("Relação com outra fragrância"), {
      target: { value: "original" },
    });
    expect(screen.getByLabelText("Perfume de referência")).toHaveAttribute("readonly");
    fireEvent.change(screen.getByLabelText("Relação com outra fragrância"), {
      target: { value: "inspiration" },
    });
    expect(screen.getByLabelText("Perfume de referência")).toHaveValue("Referencia salva");
  });

  it("accepts JPG, PNG, AVIF, and WebP cover uploads and explains image preservation", () => {
    render(<PerfumeForm />);
    expect(screen.getByLabelText("Imagem do perfume")).toHaveAttribute(
      "accept",
      "image/jpeg,image/png,image/avif,image/webp",
    );
    expect(screen.getByText("Clique para mudar")).toBeInTheDocument();
    expect(screen.getByText("JPG, PNG, AVIF ou WebP")).toBeInTheDocument();
    expect(screen.getByText("máximo de 5 MB.")).toBeInTheDocument();
  });

  it("shows a local cover preview as soon as a new image is selected", async () => {
    const createObjectURL = vi.fn(() => "blob:cover-preview");
    const revokeObjectURL = vi.fn();

    Object.defineProperties(URL, {
      createObjectURL: {
        configurable: true,
        value: createObjectURL,
      },
      revokeObjectURL: {
        configurable: true,
        value: revokeObjectURL,
      },
    });

    const user = userEvent.setup();
    render(<PerfumeForm />);

    const file = new File(["cover"], "cover.webp", { type: "image/webp" });
    await user.upload(screen.getByLabelText("Imagem do perfume"), file);

    expect(createObjectURL).toHaveBeenCalledWith(file);
    expect(
      screen.getByAltText("Prévia da nova imagem selecionada"),
    ).toHaveAttribute("src", "blob:cover-preview");
  });

  it("keeps persisted remodel fields available for save", async () => {
    const user = userEvent.setup();
    render(<PerfumeForm perfume={perfume} />);

    await user.clear(screen.getByLabelText("Docura (%)"));
    await user.type(screen.getByLabelText("Docura (%)"), "42");

    expect(document.querySelector('input[name="launchYear"]')).toHaveValue(2024);
    expect(document.querySelector('input[name="sweetness"]')).toHaveValue(42);
    expect(screen.queryByLabelText("Tags de perfil")).not.toBeInTheDocument();
    expect(document.querySelector('input[name="profileTags"]')).toHaveValue(JSON.stringify([]));
  });

  it("renders fragrance profile as performance and sensory columns without profile tags", () => {
    render(<PerfumeForm perfume={perfume} />);

    expect(screen.getByRole("group", { name: "Perfil da fragrância" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Desempenho" })).toBeInTheDocument();
    const profile = screen.getByRole("group", { name: "Perfil sensorial" });
    expect(profile).not.toHaveTextContent("Media informada");
    expect(screen.getByLabelText("Intensidade (%)")).toHaveValue(88);
    expect(screen.getByLabelText("Docura (%)")).toHaveValue(null);
    expect(screen.getByLabelText("Frescor (%)")).toHaveValue(0);
    expect(screen.getByLabelText("Elegância (%)")).toHaveValue(70);
    expect(screen.getByLabelText("Sensualidade (%)")).toHaveValue(65);
    expect(
      screen.queryByRole("list", { name: "Tags de perfil selecionados" }),
    ).not.toBeInTheDocument();
    expect(document.querySelector('input[name="profileTags"]')).toHaveValue(JSON.stringify([]));
  });

  it("keeps cancel secondary and save primary actions reachable at the end", () => {
    render(<PerfumeForm perfume={perfume} />);

    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(screen.getByRole("link", { name: "Cancelar" })).toHaveAttribute(
      "href",
      "/colecao/owned",
    );
    expect(screen.getByRole("button", { name: "Salvar alterações" })).toHaveAttribute(
      "type",
      "submit",
    );
  });

  it("keeps performance and usage metrics editable with empty, zero, and one hundred states", async () => {
    const user = userEvent.setup();
    render(
      <PerfumeForm
        perfume={{
          ...perfume,
          scores: [
            { category: "performance", metricKey: "fixacao", score: 100 },
            { category: "performance", metricKey: "projecao", score: 0 },
            { category: "season", metricKey: "verao", score: 75 },
            { category: "occasion", metricKey: "trabalho", score: null },
            { category: "time", metricKey: "noite", score: 100 },
            { category: "environment", metricKey: "fechado", score: 65 },
          ],
        }}
      />,
    );

    expect(screen.getByRole("group", { name: "Desempenho" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Quando usar" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Estações" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Ocasiões" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Horários" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Ambiente" })).toBeInTheDocument();
    expect(screen.getByLabelText("Fixação (%)")).toHaveAttribute("inputmode", "numeric");
    expect(screen.getByLabelText("Fixação (%)")).toHaveValue(100);
    expect(screen.getByLabelText("Projeção (%)")).toHaveValue(0);
    expect(screen.getByLabelText("Trabalho (%)")).toHaveValue(null);
    expect(screen.getByLabelText("Academia (%)")).toBeInTheDocument();
    expect(screen.getByLabelText("Dia Inteiro (%)")).toBeInTheDocument();
    expect(screen.getByLabelText("Fechado (%)")).toHaveValue(65);
    expect(screen.getAllByText("100%").length).toBeGreaterThan(0);
    expect(screen.getAllByText("0%").length).toBeGreaterThan(4);

    await user.clear(screen.getByLabelText("Verão (%)"));
    await user.type(screen.getByLabelText("Rastro (%)"), "42");

    expect(document.querySelector('input[name="scores"]')).toHaveValue(
      JSON.stringify([
        { category: "performance", metricKey: "fixacao", score: 100 },
        { category: "performance", metricKey: "projecao", score: 0 },
        { category: "performance", metricKey: "rastro", score: 42 },
        { category: "performance", metricKey: "versatilidade", score: null },
        { category: "performance", metricKey: "presenca", score: null },
        { category: "season", metricKey: "primavera", score: null },
        { category: "season", metricKey: "verao", score: null },
        { category: "season", metricKey: "outono", score: null },
        { category: "season", metricKey: "inverno", score: null },
        { category: "occasion", metricKey: "ar_livre", score: null },
        { category: "occasion", metricKey: "casual", score: null },
        { category: "occasion", metricKey: "encontro", score: null },
        { category: "occasion", metricKey: "festa", score: null },
        { category: "occasion", metricKey: "formal", score: null },
        { category: "occasion", metricKey: "trabalho", score: null },
        { category: "time", metricKey: "manha", score: null },
        { category: "time", metricKey: "tarde", score: null },
        { category: "time", metricKey: "noite", score: 100 },
        { category: "time", metricKey: "madrugada", score: null },
        { category: "environment", metricKey: "ar_livre", score: null },
        { category: "environment", metricKey: "fechado", score: 65 },
      ]),
    );
  });

  it("summarizes an existing cover without requiring a replacement", () => {
    render(
      <PerfumeForm
        perfume={{
          ...perfume,
          imageUrl: "https://example.com/cover.webp",
        }}
      />,
    );

    expect(screen.getByAltText("Imagem atual de Essencial")).toBeInTheDocument();
    expect(screen.queryByText("Capa atual")).not.toBeInTheDocument();
    expect(screen.queryByText("Clique para substituir")).not.toBeInTheDocument();
  });

  it("renders long identity and classification values without dropping fields", () => {
    const longFamily = "Amadeirado especiado aromatico muito persistente";
    const longTag = "Assinatura noturna extremamente longa para testar quebra de chip";
    const longPerfume = {
      ...perfume,
      brand: "Maison Experimental de Fragrâncias Muito Longas e Curadoria Privada",
      name: "Essencial Absoluto Edicao Especial de Inventario Sensorial Prolongado",
      olfactoryFamilies: [longFamily],
      profileTags: [longTag],
      notes: {
        top: ["Uma nota de saída muito longa para testar quebra visual"],
        heart: [],
        base: ["Ambar"],
      },
    };

    render(<PerfumeForm perfume={longPerfume} />);

    expect(screen.getByRole("heading", { name: "Fragrância" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: `Editar ${longPerfume.name}` })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Marca")).toHaveValue(longPerfume.brand);
    expect(screen.getByLabelText("Nome do perfume")).toHaveValue(longPerfume.name);
    expect(screen.queryByText(longFamily)).not.toBeInTheDocument();
    expect(document.querySelector('input[name="olfactoryFamilies"]')).toHaveValue(
      JSON.stringify([longFamily]),
    );
    expect(screen.queryByText(longTag)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Notas de coração")).toHaveValue("");
  });

  it("requires a manual bottle format for new perfumes and preserves the edited value", () => {
    const { unmount } = render(<PerfumeForm />);

    expect(screen.getByLabelText("Formato na estante")).toHaveValue("");
    expect(screen.getByLabelText("Formato na estante")).toBeRequired();
    expect(
      screen.getByRole("option", { name: "Selecione o formato" }),
    ).toBeDisabled();

    unmount();
    render(<PerfumeForm perfume={perfume} />);

    expect(screen.getByLabelText("Formato na estante")).toHaveValue(
      perfume.bottleFormat,
    );
  });

  it("keeps accords editable without family tags or form preview bars", () => {
    render(<PerfumeForm perfume={perfume} />);

    fireEvent.change(screen.getByLabelText("Acordes principais"), {
      target: {
        value:
          "acorde extremamente longo com muitas palavras para testar quebra: 25\ncitrico: 95\ndoce:",
      },
    });

    expect(screen.queryByLabelText("Famílias olfativas")).not.toBeInTheDocument();
    expect(document.querySelector('input[name="olfactoryFamilies"]')).toHaveValue(
      JSON.stringify(["Amadeirado"]),
    );
    expect(screen.queryByRole("list", { name: "Famílias olfativas selecionados" })).not.toBeInTheDocument();
    expect(screen.queryByRole("progressbar", { name: "citrico: 95%" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Acordes principais")).toHaveValue(
      "acorde extremamente longo com muitas palavras para testar quebra: 25\ncitrico: 95\ndoce:",
    );
  });

  it("keeps composition hidden inputs in sync with note and accord edits", () => {
    render(<PerfumeForm />);

    fireEvent.change(screen.getByLabelText("Notas de saída"), {
      target: { value: "Limao, Bergamota" },
    });
    fireEvent.change(screen.getByLabelText("Notas de coração"), {
      target: { value: "Cedro" },
    });
    fireEvent.change(screen.getByLabelText("Notas de fundo"), {
      target: { value: "Ambar" },
    });
    fireEvent.change(screen.getByLabelText("Acordes principais"), {
      target: { value: "verde: 70\nmusgo:" },
    });

    expect(document.querySelector('input[name="notes"]')).toHaveValue(
      JSON.stringify({
        top: ["Limao", "Bergamota"],
        heart: ["Cedro"],
        base: ["Ambar"],
      }),
    );
    expect(document.querySelector('input[name="scores"]')).toHaveValue(
      JSON.stringify([
        { category: "performance", metricKey: "fixacao", score: null },
        { category: "performance", metricKey: "projecao", score: null },
        { category: "performance", metricKey: "rastro", score: null },
        { category: "performance", metricKey: "versatilidade", score: null },
        { category: "performance", metricKey: "presenca", score: null },
        { category: "season", metricKey: "primavera", score: null },
        { category: "season", metricKey: "verao", score: null },
        { category: "season", metricKey: "outono", score: null },
        { category: "season", metricKey: "inverno", score: null },
        { category: "occasion", metricKey: "ar_livre", score: null },
        { category: "occasion", metricKey: "casual", score: null },
        { category: "occasion", metricKey: "encontro", score: null },
        { category: "occasion", metricKey: "festa", score: null },
        { category: "occasion", metricKey: "formal", score: null },
        { category: "occasion", metricKey: "trabalho", score: null },
        { category: "time", metricKey: "manha", score: null },
        { category: "time", metricKey: "tarde", score: null },
        { category: "time", metricKey: "noite", score: null },
        { category: "time", metricKey: "madrugada", score: null },
        { category: "environment", metricKey: "ar_livre", score: null },
        { category: "environment", metricKey: "fechado", score: null },
        { category: "accord", metricKey: "verde", score: 70 },
        { category: "accord", metricKey: "musgo", score: null },
      ]),
    );
    expect(screen.getByLabelText("Notas de saída")).toHaveValue("Limao, Bergamota");
  });
});
