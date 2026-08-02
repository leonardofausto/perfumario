import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AutofillResponse } from "@/features/perfume-autofill/types";

import {
  PerfumeAutofill,
  type AutofillFormValues,
} from "./perfume-autofill";

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
} as const;

const current: AutofillFormValues = {
  name: "",
  brand: "",
  description: "",
  concentration: "unknown",
  categoryType: null,
  audience: null,
  launchYear: null,
  inspirationKind: "original",
  inspiredBy: null,
  olfactoryFamilies: [],
  pyramid: { top: "", heart: "", base: "" },
  accords: "",
  metrics: emptyMetrics,
};

function field<T>(value: T | null, options = {}) {
  return {
    value,
    confidence: value === null ? 0 : 0.9,
    origin: value === null ? ("unavailable" as const) : ("official" as const),
    sources: value === null ? [] : ["official"],
    conflicts: [],
    inferred: false,
    ...options,
  };
}

const result: AutofillResponse = {
  query: { name: "Fakhar Black", brand: "Lattafa" },
  fields: {
    name: field("Fakhar Black"),
    brand: field("Lattafa"),
    description: field("Uma fragrância aromática."),
    concentration: field("eau_de_parfum"),
    categoryType: field("arabe"),
    audience: field("masculine"),
    launchYear: field(2022),
    inspirationKind: field("inspiration"),
    inspiredBy: field("Y Eau de Parfum"),
    olfactoryFamilies: field(["Aromático", "Amadeirado"]),
    pyramid: field({
      top: "Maçã - Bergamota",
      heart: "Lavanda - Sálvia",
      base: "Cedro - Fava tonka",
    }),
    accords: field("Aromático: 90\nAmadeirado: 80"),
    metrics: field({ ...emptyMetrics, fixacao: 82, noite: 75 }),
  },
  sources: [
    {
      id: "official",
      kind: "official",
      title: "Lattafa",
      url: "https://lattafa.com/fakhar-black",
    },
  ],
  confidence: 0.91,
  explanation: "Identificação consistente.",
  warnings: [],
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("PerfumeAutofill", () => {
  it("searches by name with optional brand and only applies after confirmation", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: "success", result }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <PerfumeAutofill
        mode="create"
        query={{ name: "Fakhar Black", brand: "Lattafa" }}
        current={current}
        onApply={onApply}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Buscar dados" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/perfumes/autofill",
      expect.objectContaining({
        body: JSON.stringify({
          name: "Fakhar Black",
          brand: "Lattafa",
          ignoreCache: false,
        }),
      }),
    );
    expect(
      await screen.findByText(/Inspiração · Y Eau de Parfum/),
    ).toBeInTheDocument();
    expect(onApply).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Aplicar ao cadastro" }));

    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Fakhar Black",
        inspirationKind: "inspiration",
        inspiredBy: "Y Eau de Parfum",
      }),
    );
  });

  it("omits an empty brand from a name-only request", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: "success", result }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(
      <PerfumeAutofill
        mode="create"
        query={{ name: "Fakhar Black" }}
        current={current}
        onApply={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Buscar dados" }));

    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).toEqual({
      name: "Fakhar Black",
      ignoreCache: false,
    });
  });

  it("keeps absent fields untouched and applies a dupe reference as one unit", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    const dupeResult: AutofillResponse = {
      ...result,
      fields: {
        ...result.fields,
        description: field(null),
        brand: field(null),
        inspirationKind: field("dupe"),
        inspiredBy: field("Y Eau de Parfum"),
      },
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: "success", result: dupeResult }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    render(
      <PerfumeAutofill
        mode="create"
        query={{ name: "Fakhar Black" }}
        current={current}
        onApply={onApply}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Buscar dados" }));
    await user.click(
      await screen.findByRole("button", { name: "Aplicar ao cadastro" }),
    );

    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({
        inspirationKind: "dupe",
        inspiredBy: "Y Eau de Parfum",
      }),
    );
    expect(onApply.mock.calls[0][0]).not.toHaveProperty("description");
    expect(onApply.mock.calls[0][0]).not.toHaveProperty("brand");
  });

  it("preserves edit values by default and applies only selected differences", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    const partial = {
      ...result,
      fields: {
        ...result.fields,
        description: field("Descrição nova", {
          confidence: 0.62,
          origin: "inference" as const,
          inferred: true,
          conflicts: [
            { value: "Descrição alternativa", sources: ["specialized"] },
          ],
        }),
      },
      warnings: [
        {
          code: "source_conflict",
          message: "As fontes divergem sobre a descrição.",
          field: "description" as const,
        },
      ],
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: "partial", result: partial }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    render(
      <PerfumeAutofill
        mode="edit"
        query={{ name: "Fakhar Black" }}
        current={{ ...current, name: "Fakhar Black", description: "Atual" }}
        onApply={onApply}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Buscar dados" }));

    expect(await screen.findByText("Resultado parcial")).toBeInTheDocument();
    expect(screen.getByText("As fontes divergem sobre a descrição.")).toBeInTheDocument();
    expect(onApply).not.toHaveBeenCalled();
    expect(
      screen.queryByText(/Formato na estante|Imagem do perfume/),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Selecionar tudo" }));
    expect(
      screen.getByRole("button", { name: "Aplicar selecionados" }),
    ).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Desmarcar tudo" }));
    expect(
      screen.getByRole("button", { name: "Aplicar selecionados" }),
    ).toBeDisabled();

    await user.click(screen.getByRole("checkbox", { name: /Descrição/ }));
    await user.click(screen.getByRole("button", { name: "Aplicar selecionados" }));

    expect(onApply).toHaveBeenCalledWith({ description: "Descrição nova" });
  });

  it("shows progress stages and cancels the active request", async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, options: RequestInit) => {
        signal = options.signal as AbortSignal;
        return new Promise((_resolve, reject) => {
          signal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          );
        });
      }),
    );

    render(
      <PerfumeAutofill
        mode="create"
        query={{ name: "Fakhar Black" }}
        current={current}
        onApply={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Buscar dados" }));
    expect(screen.getByText("Pesquisando fragrância…")).toBeInTheDocument();

    await act(() => vi.advanceTimersByTimeAsync(350));
    expect(screen.getByText("Consultando fontes…")).toBeInTheDocument();
    await act(() => vi.advanceTimersByTimeAsync(550));
    expect(screen.getByText("Consolidando informações…")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    await act(() => vi.runAllTimersAsync());
    expect(signal?.aborted).toBe(true);
    expect(screen.getByText("Pesquisa cancelada.")).toBeInTheDocument();
  });

  it.each([
    [404, "not_found", "Fragrância não encontrada."],
    [429, "rate_limited", "Limite de pesquisas atingido."],
    [504, "timeout", "A pesquisa demorou demais."],
    [500, "internal_error", "Não foi possível concluir a pesquisa."],
  ])("shows controlled error state for HTTP %s", async (status, code, message) => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { code } }), {
          status,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    render(
      <PerfumeAutofill
        mode="create"
        query={{ name: "Inexistente" }}
        current={current}
        onApply={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Buscar dados" }));
    expect(await screen.findByText(new RegExp(message))).toBeInTheDocument();
  });
});
