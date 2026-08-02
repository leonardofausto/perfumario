import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { UserEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RecommenderPerfume } from "@/features/recommender/types";

import { RecommenderView } from "./recommender-view";

const perfumes: RecommenderPerfume[] = [
  {
    launchYear: null,
    categoryType: null,
    audience: null,
    intensity: null,
    sweetness: null,
    freshness: null,
    elegance: null,
    sensuality: null,
    profileTags: [],
    id: "one",
    brand: "Marca",
    name: "Persistido",
    concentration: "unknown",
    bottleFormat: "full_bottle",
    inspirationKind: "original",
    inspiredBy: null,
    olfactoryFamilies: ["Não catalogada"],
    imageUrl: null,
    isFavorite: false,
    scores: [
      { category: "occasion", metricKey: "trabalho", score: 70 },
      { category: "time", metricKey: "manha", score: 60 },
      { category: "environment", metricKey: "fechado", score: 60 },
      { category: "performance", metricKey: "versatilidade", score: 70 },
      { category: "performance", metricKey: "fixacao", score: 60 },
      { category: "performance", metricKey: "presenca", score: 65 },
    ],
  },
];

function recommenderPerfume(
  id: string,
  name: string,
  score: number,
): RecommenderPerfume {
  return {
    ...perfumes[0],
    id,
    name,
    freshness: score,
    scores: [
      { category: "occasion", metricKey: "trabalho", score },
      { category: "time", metricKey: "manha", score },
      { category: "environment", metricKey: "fechado", score },
      { category: "performance", metricKey: "versatilidade", score },
      { category: "performance", metricKey: "fixacao", score },
      { category: "performance", metricKey: "presenca", score },
    ],
  };
}

async function activateManualContext(
  user: UserEvent,
  options: { clima?: string; temperatura?: string } = {},
) {
  await user.click(screen.getByRole("button", { name: "Ajustar contexto manualmente" }));
  fireEvent.change(screen.getByLabelText("Cidade"), {
    target: { value: "Curitiba" },
  });
  fireEvent.change(screen.getByLabelText("Temperatura"), {
    target: { value: options.temperatura ?? "18" },
  });
  fireEvent.change(screen.getByLabelText("Clima"), {
    target: { value: options.clima ?? "Chuvoso" },
  });
  await user.click(screen.getByRole("button", { name: "Usar contexto manual" }));
}

describe("RecommenderView", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("switches automatic context activation into refresh mode after a successful update", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            city: "S\u00e3o Paulo",
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            current: {
              temperature_2m: 24,
              apparent_temperature: 26,
              weather_code: 1,
              precipitation: 0,
              wind_speed_10m: 9,
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            city: "S\u00e3o Paulo",
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            current: {
              temperature_2m: 25,
              apparent_temperature: 27,
              weather_code: 2,
              precipitation: 0.4,
              wind_speed_10m: 11,
            },
          }),
        })
    );
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
      success({
        coords: {
          latitude: -23.55,
          longitude: -46.63,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as GeolocationPosition);
    });
    vi.stubGlobal("navigator", {
      geolocation: { getCurrentPosition },
    });

    render(<RecommenderView perfumes={perfumes} />);

    const activateButton = screen.getByRole("button", {
      name: "Ativar contexto autom\u00e1tico",
    });
    await user.click(activateButton);

    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByRole("button", { name: "Atualizar contexto" })
    ).toBeEnabled();
    expect(screen.getByText(/Atualizado \u00e0s/)).toBeInTheDocument();
    expect(screen.getByText("Contexto autom\u00e1tico")).toBeInTheDocument();
    const removedReversePath = ["/v1", "reverse"].join("/");
    expect(
      (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.some(([url]) =>
        String(url).includes(removedReversePath)
      )
    ).toBe(false);

    await user.click(screen.getByRole("button", { name: "Atualizar contexto" }));
    expect(getCurrentPosition).toHaveBeenCalledTimes(2);

    vi.unstubAllGlobals();
  });

  it("keeps automatic status and update time in the left context group", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ city: "Volta Redonda" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            current: {
              temperature_2m: 28,
              apparent_temperature: 30,
              weather_code: 2,
              precipitation: 0,
              wind_speed_10m: 8,
            },
          }),
        })
    );
    vi.stubGlobal("navigator", {
      geolocation: {
        getCurrentPosition: (success: PositionCallback) => {
          success({
            coords: {
              latitude: -22.52,
              longitude: -44.1,
              accuracy: 10,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            },
            timestamp: Date.now(),
          } as GeolocationPosition);
        },
      },
    });

    render(<RecommenderView perfumes={perfumes} />);

    await user.click(
      screen.getByRole("button", { name: "Ativar contexto autom\u00e1tico" })
    );

    const contextSummary = await screen.findByTestId("context-summary-meta");
    expect(contextSummary).toHaveTextContent(
      /Contexto autom\u00e1tico.*Atualizado \u00e0s/
    );
    expect(contextSummary).not.toHaveTextContent(
      "Uma autoriza\u00e7\u00e3o preenche cidade e clima nas pr\u00f3ximas visitas."
    );
    expect(screen.getByText("Volta Redonda")).toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  it("does not overwrite manual fields when automatic context is refreshed", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            city: "Curitiba",
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            current: {
              temperature_2m: 19,
              apparent_temperature: 18,
              weather_code: 61,
              precipitation: 1.2,
              wind_speed_10m: 14,
            },
          }),
        })
    );
    vi.stubGlobal("navigator", {
      geolocation: {
        getCurrentPosition: (success: PositionCallback) => {
          success({
            coords: {
              latitude: -25.43,
              longitude: -49.27,
              accuracy: 10,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            },
            timestamp: Date.now(),
          } as GeolocationPosition);
        },
      },
    });

    render(<RecommenderView perfumes={perfumes} />);

    await user.click(screen.getByRole("button", { name: "Ajustar contexto manualmente" }));
    await user.clear(screen.getByLabelText("Cidade"));
    await user.type(screen.getByLabelText("Cidade"), "Manual City");

    await user.click(
      screen.getByRole("button", { name: "Ativar contexto autom\u00e1tico" })
    );

    expect(screen.getByLabelText("Cidade")).toHaveValue("Manual City");

    vi.unstubAllGlobals();
  });

  it("keeps the current mode and data when automatic context cannot identify the city", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ city: "" }),
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          current: {
            temperature_2m: 24,
            apparent_temperature: 26,
            weather_code: 1,
            precipitation: 0,
            wind_speed_10m: 9,
          },
        }),
      })
    );
    vi.stubGlobal("navigator", {
      geolocation: {
        getCurrentPosition: (success: PositionCallback) => {
          success({
            coords: {
              latitude: -23.55,
              longitude: -46.63,
              accuracy: 10,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            },
            timestamp: Date.now(),
          } as GeolocationPosition);
        },
      },
    });

    render(<RecommenderView perfumes={perfumes} />);

    await user.click(
      screen.getByRole("button", { name: "Ativar contexto autom\u00e1tico" })
    );

    expect(
      await screen.findByText(
        "N\u00e3o foi poss\u00edvel identificar sua cidade neste momento."
      )
    ).toBeInTheDocument();
    expect(screen.queryByText("Contexto autom\u00e1tico")).toBeNull();
    expect(screen.getByText("Cidade n\u00e3o definida")).toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  it("keeps the current data when only the weather request fails", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ city: "Curitiba" }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({}),
        })
    );
    vi.stubGlobal("navigator", {
      geolocation: {
        getCurrentPosition: (success: PositionCallback) => {
          success({
            coords: {
              latitude: -25.43,
              longitude: -49.27,
              accuracy: 10,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            },
            timestamp: Date.now(),
          } as GeolocationPosition);
        },
      },
    });

    render(<RecommenderView perfumes={perfumes} />);

    await user.click(
      screen.getByRole("button", { name: "Ativar contexto autom\u00e1tico" })
    );

    expect(
      await screen.findByText("N\u00e3o foi poss\u00edvel atualizar os dados clim\u00e1ticos.")
    ).toBeInTheDocument();
    expect(screen.queryByText("Contexto autom\u00e1tico")).toBeNull();
    expect(screen.getByText("Cidade n\u00e3o definida")).toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  it("activates manual context only after the user applies the manual form", async () => {
    const user = userEvent.setup();
    render(<RecommenderView perfumes={perfumes} />);

    await user.click(screen.getByRole("button", { name: "Ajustar contexto manualmente" }));
    fireEvent.change(screen.getByLabelText("Cidade"), {
      target: { value: "Curitiba" },
    });
    fireEvent.change(screen.getByLabelText("Temperatura"), {
      target: { value: "18" },
    });
    fireEvent.change(screen.getByLabelText("Clima"), {
      target: { value: "Chuvoso" },
    });
    fireEvent.change(screen.getByLabelText("Esta\u00e7\u00e3o"), {
      target: { value: "Inverno" },
    });

    expect(screen.queryByText("Contexto manual")).toBeNull();
    expect(screen.getByText("Cidade n\u00e3o definida")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Usar contexto manual" }));

    expect(await screen.findByText("Contexto manual")).toBeInTheDocument();
    expect(screen.getByText("Curitiba")).toBeInTheDocument();
    expect(screen.getByText("18\u00b0C")).toBeInTheDocument();
    expect(screen.getByText("Chuvoso")).toBeInTheDocument();
    expect(screen.getAllByText("Inverno").length).toBeGreaterThan(0);
    expect(screen.getAllByText("\u2014")).toHaveLength(3);
    expect(
      screen.getByRole("button", { name: "Contexto manual ativo" })
    ).toBeEnabled();
  });

  it("shows weather information with city above six uniform indicators", () => {
    render(<RecommenderView perfumes={perfumes} />);

    expect(screen.getByText("Cidade n\u00e3o definida")).toBeInTheDocument();

    for (const label of [
      "Temperatura",
      "Sensa\u00e7\u00e3o",
      "Clima",
      "Esta\u00e7\u00e3o",
      "Chuva",
      "Vento",
    ]) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }

    expect(screen.getAllByText("\u2014")).toHaveLength(5);
  });

  it("renders the redesigned choice panel with the six real option groups", () => {
    render(<RecommenderView perfumes={perfumes} />);

    const choicePanel = screen.getByRole("region", {
      name: "Ajustes da escolha",
    });

    for (const group of [
      "Desempenho",
      "Perfil sensorial",
      "Estações",
      "Ocasiões",
      "Melhor horário",
      "Ambiente",
    ]) {
      expect(
        within(choicePanel).getByRole("group", { name: group })
      ).toBeInTheDocument();
    }

    expect(within(choicePanel).getByRole("button", { name: "Fixação" })).toBeInTheDocument();
    expect(within(choicePanel).getByRole("button", { name: "Elegância" })).toBeInTheDocument();
    expect(within(choicePanel).getByRole("button", { name: "Inverno" })).toBeInTheDocument();
    expect(within(choicePanel).getByRole("button", { name: "Trabalho" })).toBeInTheDocument();
    expect(within(choicePanel).getByRole("button", { name: "Dia inteiro" })).toBeInTheDocument();
    expect(within(choicePanel).getByRole("button", { name: "Fechado" })).toBeInTheDocument();
  });

  it("allows selecting and removing multiple options in the same group", async () => {
    const user = userEvent.setup();
    render(<RecommenderView perfumes={perfumes} />);

    const choicePanel = screen.getByRole("region", {
      name: "Ajustes da escolha",
    });
    const performanceGroup = within(choicePanel).getByRole("group", {
      name: "Desempenho",
    });
    const fixation = within(performanceGroup).getByRole("button", {
      name: "Fixação",
    });
    const presence = within(performanceGroup).getByRole("button", {
      name: "Presença",
    });

    await user.click(fixation);
    await user.click(presence);

    expect(fixation).toHaveAttribute("aria-pressed", "true");
    expect(presence).toHaveAttribute("aria-pressed", "true");

    await user.click(fixation);

    expect(fixation).toHaveAttribute("aria-pressed", "false");
    expect(presence).toHaveAttribute("aria-pressed", "true");
  });

  it("does not show removed options or a weather filter in the choice panel", () => {
    render(<RecommenderView perfumes={perfumes} />);

    const choicePanel = screen.getByRole("region", {
      name: "Ajustes da escolha",
    });

    expect(within(choicePanel).queryByRole("button", { name: "Passeio" })).toBeNull();
    expect(
      within(choicePanel).queryByRole("button", { name: "Fim de tarde" })
    ).toBeNull();
    expect(within(choicePanel).queryByRole("group", { name: "Clima" })).toBeNull();
    expect(within(choicePanel).queryByText("Clima")).toBeNull();
  });

  it("starts with manual context minimized", () => {
    render(<RecommenderView perfumes={perfumes} />);

    const trigger = screen.getByRole("button", {
      name: "Ajustar contexto manualmente",
    });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-controls", "manual-context-panel");
    expect(screen.queryByLabelText("Cidade")).toBeNull();
  });

  it("keeps manual context editing limited to city, temperature, weather and season", async () => {
    const user = userEvent.setup();
    render(<RecommenderView perfumes={perfumes} />);

    await user.click(screen.getByRole("button", { name: "Ajustar contexto manualmente" }));

    expect(screen.getByLabelText("Cidade")).toBeInTheDocument();
    expect(screen.getByLabelText("Temperatura")).toBeInTheDocument();
    expect(screen.getByLabelText("Clima")).toBeInTheDocument();
    expect(screen.getByLabelText("Esta\u00e7\u00e3o")).toBeInTheDocument();
    expect(screen.queryByLabelText("Sensa\u00e7\u00e3o")).toBeNull();
    expect(screen.queryByLabelText("Chuva")).toBeNull();
    expect(screen.queryByLabelText("Vento")).toBeNull();

    const fieldLabels = Array.from(document.querySelectorAll("label")).map(
      (label) => label.textContent
    );
    expect(fieldLabels).toEqual(["Cidade", "Temperatura", "Clima", "Esta\u00e7\u00e3o"]);
  });

  it("places the manual context action in the manual section header", async () => {
    const user = userEvent.setup();
    render(<RecommenderView perfumes={perfumes} />);

    expect(
      screen.queryByRole("button", { name: "Usar contexto manual" })
    ).toBeNull();

    await user.click(screen.getByRole("button", { name: "Ajustar contexto manualmente" }));

    const manualAction = screen.getByRole("button", {
      name: "Usar contexto manual",
    });
    const firstField = screen.getByLabelText("Cidade");

    expect(manualAction.compareDocumentPosition(firstField)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it("toggles manual context without clearing manually entered values", async () => {
    const user = userEvent.setup();
    render(<RecommenderView perfumes={perfumes} />);

    const trigger = screen.getByRole("button", {
      name: "Ajustar contexto manualmente",
    });

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    const city = screen.getByLabelText("Cidade");
    await user.clear(city);
    await user.type(city, "Curitiba");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("manual-context-panel")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
    expect(screen.getByLabelText("Cidade")).toBeDisabled();

    await user.click(trigger);
    expect(screen.getByLabelText("Cidade")).toHaveValue("Curitiba");
  });

  it("uses only server-provided collection candidates", async () => {
    const user = userEvent.setup();
    render(<RecommenderView perfumes={perfumes} />);

    await user.click(screen.getByRole("button", { name: "Ajustar contexto manualmente" }));
    fireEvent.change(screen.getByLabelText("Cidade"), {
      target: { value: "Curitiba" },
    });
    fireEvent.change(screen.getByLabelText("Temperatura"), {
      target: { value: "18" },
    });
    fireEvent.change(screen.getByLabelText("Clima"), {
      target: { value: "Chuvoso" },
    });
    await user.click(screen.getByRole("button", { name: "Usar contexto manual" }));
    await user.click(screen.getByRole("button", { name: "Revelar meu Top 3" }));

    expect(screen.getByText("Persistido")).toBeInTheDocument();
    expect(screen.queryByText("Armaf Odyssey Mandarin Sky")).toBeNull();
  });

  it("orients the user when automatic context is active without a successful update", async () => {
    const user = userEvent.setup();
    render(<RecommenderView perfumes={perfumes} />);

    await user.click(screen.getByRole("button", { name: "Revelar meu Top 3" }));

    expect(screen.getByText("Contexto pendente")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Ative ou atualize o contexto autom\u00e1tico, ou use o contexto manual."
      )
    ).toBeInTheDocument();
    expect(screen.queryByText("Persistido")).toBeNull();
  });

  it("shows ranking loading state and disables reveal while processing", async () => {
    const user = userEvent.setup();
    render(<RecommenderView perfumes={perfumes} />);

    await activateManualContext(user);

    const revealButton = screen.getByRole("button", {
      name: "Revelar meu Top 3",
    });
    fireEvent.click(revealButton);

    expect(
      screen.getByRole("button", { name: "Calculando..." })
    ).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Calculando Top 3");
    expect(await screen.findByText("Persistido")).toBeInTheDocument();
  });

  it("shows one ranked perfume when the collection has one candidate", async () => {
    const user = userEvent.setup();
    render(<RecommenderView perfumes={[recommenderPerfume("one", "Solo", 80)]} />);

    await user.click(screen.getByRole("button", { name: "Ajustar contexto manualmente" }));
    fireEvent.change(screen.getByLabelText("Cidade"), {
      target: { value: "Curitiba" },
    });
    fireEvent.change(screen.getByLabelText("Temperatura"), {
      target: { value: "18" },
    });
    fireEvent.change(screen.getByLabelText("Clima"), {
      target: { value: "Chuvoso" },
    });
    await user.click(screen.getByRole("button", { name: "Usar contexto manual" }));
    await user.click(screen.getByRole("button", { name: "Revelar meu Top 3" }));

    expect(screen.getByText("Solo")).toBeInTheDocument();
    expect(screen.queryByText("2\u00ba")).toBeNull();
  });

  it("shows two ranked perfumes when the collection has two candidates", async () => {
    const user = userEvent.setup();
    render(
      <RecommenderView
        perfumes={[
          recommenderPerfume("one", "Primeiro", 90),
          recommenderPerfume("two", "Segundo", 70),
        ]}
      />
    );

    await user.click(screen.getByRole("button", { name: "Ajustar contexto manualmente" }));
    fireEvent.change(screen.getByLabelText("Cidade"), {
      target: { value: "Curitiba" },
    });
    fireEvent.change(screen.getByLabelText("Temperatura"), {
      target: { value: "18" },
    });
    fireEvent.change(screen.getByLabelText("Clima"), {
      target: { value: "Chuvoso" },
    });
    await user.click(screen.getByRole("button", { name: "Usar contexto manual" }));
    await user.click(screen.getByRole("button", { name: "Revelar meu Top 3" }));

    expect(screen.getByText("Primeiro")).toBeInTheDocument();
    expect(screen.getByText("Segundo")).toBeInTheDocument();
    expect(screen.queryByText("3\u00ba")).toBeNull();
  });

  it("renders ranking cards with image and fallback image states", async () => {
    const user = userEvent.setup();
    render(
      <RecommenderView
        perfumes={[
          {
            ...recommenderPerfume("with-image", "Com imagem", 85),
            imageUrl: "https://images.example/perfume.webp",
          },
          recommenderPerfume("without-image", "Sem imagem", 65),
        ]}
      />
    );

    await activateManualContext(user);
    await user.click(screen.getByRole("button", { name: "Revelar meu Top 3" }));

    expect(screen.getByRole("img", { name: "Com imagem" })).toHaveAttribute(
      "src",
      "https://images.example/perfume.webp"
    );
    expect(
      screen.getByRole("img", {
        name: "Imagem não disponível para Sem imagem",
      })
    ).toHaveTextContent("S");
  });

  it("offers a details action for each ranked perfume", async () => {
    const user = userEvent.setup();
    render(<RecommenderView perfumes={[recommenderPerfume("detail-id", "Detalhado", 82)]} />);

    await activateManualContext(user);
    await user.click(screen.getByRole("button", { name: "Revelar meu Top 3" }));

    expect(screen.getByRole("link", { name: "Abrir detalhes" })).toHaveAttribute(
      "href",
      "/colecao/detail-id?from=recomendador"
    );
  });

  it("restores the revealed ranking and selected filters after returning from details", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<RecommenderView perfumes={perfumes} />);

    await activateManualContext(user);
    await user.click(screen.getByRole("button", { name: /Fix/ }));
    await user.click(screen.getByRole("button", { name: "Fechado" }));
    await user.click(screen.getByRole("button", { name: "Revelar meu Top 3" }));

    expect(screen.getByText("Persistido")).toBeInTheDocument();
    unmount();

    render(<RecommenderView perfumes={perfumes} />);

    await waitFor(() => {
      expect(screen.getByText("Persistido")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /Fix/ })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Fechado" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByText("Contexto manual")).toBeInTheDocument();
  });

  it("refreshes persisted ranking image URLs from the current perfume payload", async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <RecommenderView
        perfumes={[
          {
            ...recommenderPerfume("image-id", "Imagem atual", 85),
            imageUrl: "https://images.example/old.webp",
          },
        ]}
      />
    );

    await activateManualContext(user);
    await user.click(screen.getByRole("button", { name: "Revelar meu Top 3" }));
    expect(screen.getByRole("img", { name: "Imagem atual" })).toHaveAttribute(
      "src",
      "https://images.example/old.webp"
    );
    unmount();

    render(
      <RecommenderView
        perfumes={[
          {
            ...recommenderPerfume("image-id", "Imagem atual", 85),
            imageUrl: "https://images.example/fresh.webp",
          },
        ]}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("img", { name: "Imagem atual" })).toHaveAttribute(
        "src",
        "https://images.example/fresh.webp"
      );
    });
  });

  it("renders textual compatibility without progress bars", async () => {
    const user = userEvent.setup();
    const scoredPerfume = (id: string, name: string, score: number) => ({
      ...recommenderPerfume(id, name, score),
      intensity: score,
      sweetness: score,
      freshness: score,
      elegance: score,
      sensuality: score,
    });

    render(
      <RecommenderView
        perfumes={[
          scoredPerfume("high", "Alto", 90),
          scoredPerfume("medium", "Medio", 55),
          scoredPerfume("low", "Baixo", 25),
        ]}
      />
    );

    await activateManualContext(user, {
      clima: "Céu limpo",
      temperatura: "30",
    });
    await user.click(screen.getByRole("button", { name: "Revelar meu Top 3" }));

    expect(screen.queryByRole("meter")).toBeNull();
    expect(screen.getByText("Compatibilidade: 90%")).toBeInTheDocument();
    expect(screen.getByText("Compatibilidade: 55%")).toBeInTheDocument();
    expect(screen.getByText("Compatibilidade: 25%")).toBeInTheDocument();
    expect(screen.queryByText(/Combina/)).toBeNull();
  });

  it("shows the premium badge and dynamic reasons only for the first ranked perfume", async () => {
    const user = userEvent.setup();
    render(
      <RecommenderView
        perfumes={[
          recommenderPerfume("top", "Alta", 95),
          recommenderPerfume("mid", "Media", 60),
          recommenderPerfume("low", "Baixa", 20),
        ]}
      />
    );

    await activateManualContext(user, {
      clima: "C\u00e9u limpo",
      temperatura: "30",
    });
    await user.click(screen.getByRole("button", { name: "Revelar meu Top 3" }));

    expect(screen.getByText("MELHOR ESCOLHA PARA AGORA")).toBeInTheDocument();

    const firstCard = screen.getByText("Alta").closest("article");
    const secondCard = screen.getByText("Media").closest("article");
    const thirdCard = screen.getByText("Baixa").closest("article");

    expect(firstCard).not.toBeNull();
    expect(secondCard).not.toBeNull();
    expect(thirdCard).not.toBeNull();
    expect(firstCard).toHaveTextContent("\u2713");
    expect(secondCard).not.toHaveTextContent("\u2713");
    expect(thirdCard).not.toHaveTextContent("\u2713");
    expect(secondCard).not.toHaveTextContent("MELHOR ESCOLHA PARA AGORA");
    expect(thirdCard).not.toHaveTextContent("MELHOR ESCOLHA PARA AGORA");
  });

  it("orders three or more perfumes by real compatibility", async () => {
    const user = userEvent.setup();
    render(
      <RecommenderView
        perfumes={[
          recommenderPerfume("low", "Baixa", 20),
          recommenderPerfume("top", "Alta", 95),
          recommenderPerfume("mid", "Media", 60),
          recommenderPerfume("extra", "Extra", 50),
        ]}
      />
    );

    await user.click(screen.getByRole("button", { name: "Ajustar contexto manualmente" }));
    fireEvent.change(screen.getByLabelText("Cidade"), {
      target: { value: "Curitiba" },
    });
    fireEvent.change(screen.getByLabelText("Temperatura"), {
      target: { value: "18" },
    });
    fireEvent.change(screen.getByLabelText("Clima"), {
      target: { value: "Chuvoso" },
    });
    await user.click(screen.getByRole("button", { name: "Usar contexto manual" }));
    await user.click(screen.getByRole("button", { name: "Revelar meu Top 3" }));

    const rankedNames = screen
      .getAllByText(/Alta|Media|Extra|Baixa/)
      .map((item) => item.textContent);
    expect(rankedNames).toEqual(["Alta", "Media", "Extra"]);
    expect(screen.queryByText("Baixa")).toBeNull();
  });

  it("marks the ranking as stale when filters change after revealing", async () => {
    const user = userEvent.setup();
    render(<RecommenderView perfumes={perfumes} />);

    await user.click(screen.getByRole("button", { name: "Ajustar contexto manualmente" }));
    fireEvent.change(screen.getByLabelText("Cidade"), {
      target: { value: "Curitiba" },
    });
    fireEvent.change(screen.getByLabelText("Temperatura"), {
      target: { value: "18" },
    });
    fireEvent.change(screen.getByLabelText("Clima"), {
      target: { value: "Chuvoso" },
    });
    await user.click(screen.getByRole("button", { name: "Usar contexto manual" }));
    await user.click(screen.getByRole("button", { name: "Revelar meu Top 3" }));
    await user.click(screen.getByRole("button", { name: "Trabalho" }));

    expect(screen.getByText("Top 3 desatualizado")).toBeInTheDocument();
    expect(
      screen.getByText("Clique em Revelar (Novamente)")
    ).toBeInTheDocument();
  });

  it("marks the ranking as stale when the active manual context changes", async () => {
    const user = userEvent.setup();
    render(<RecommenderView perfumes={perfumes} />);

    await activateManualContext(user);
    await user.click(screen.getByRole("button", { name: "Revelar meu Top 3" }));
    await user.clear(screen.getByLabelText("Temperatura"));
    await user.type(screen.getByLabelText("Temperatura"), "24");
    await user.click(screen.getByRole("button", { name: "Contexto manual ativo" }));

    expect(screen.getByText("Top 3 desatualizado")).toBeInTheDocument();
    expect(
      screen.getByText("Clique em Revelar (Novamente)")
    ).toBeInTheDocument();
  });

  it("clears manual climate context and restores the last automatic context", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ city: "Volta Redonda" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            current: {
              temperature_2m: 28,
              apparent_temperature: 30,
              weather_code: 2,
              precipitation: 0,
              wind_speed_10m: 8,
            },
          }),
        })
    );
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
      success({
        coords: {
          latitude: -22.52,
          longitude: -44.1,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as GeolocationPosition);
    });
    vi.stubGlobal("navigator", {
      geolocation: { getCurrentPosition },
    });

    render(<RecommenderView perfumes={perfumes} />);

    await user.click(
      screen.getByRole("button", { name: "Ativar contexto autom\u00e1tico" })
    );
    expect(await screen.findByText("Volta Redonda")).toBeInTheDocument();

    await activateManualContext(user);
    await user.click(screen.getByRole("button", { name: "Trabalho" }));
    await user.click(screen.getByRole("button", { name: "Revelar meu Top 3" }));
    expect(screen.getByText("Persistido")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Limpar recomenda\u00e7\u00e3o" }));

    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Contexto autom\u00e1tico")).toBeInTheDocument();
    expect(screen.getByText("Volta Redonda")).toBeInTheDocument();
    expect(screen.queryByText("Contexto manual")).toBeNull();
    expect(screen.queryByText("Persistido")).toBeNull();
    expect(screen.queryByText("Top 3 desatualizado")).toBeNull();
    expect(screen.getByRole("button", { name: "Trabalho" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );

    await user.click(screen.getByRole("button", { name: "Ajustar contexto manualmente" }));
    expect(screen.getByLabelText("Cidade")).toHaveValue("");
    expect(screen.getByLabelText("Temperatura")).toHaveValue("");
    expect(screen.getByLabelText("Clima")).toHaveValue("");

    expect(window.sessionStorage.getItem("perfumario:recommender-session:v1")).not.toContain(
      "Curitiba"
    );

    vi.unstubAllGlobals();
  });

  it("shows an honest message when the persisted collection is empty", async () => {
    const user = userEvent.setup();
    render(<RecommenderView perfumes={[]} />);

    await user.click(screen.getByRole("button", { name: "Revelar meu Top 3" }));
    expect(screen.getByText("Sua coleção ainda não tem perfumes.")).toBeInTheDocument();
  });
});
