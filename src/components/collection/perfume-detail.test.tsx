import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/perfumes/actions", () => ({
  toggleFavoriteAction: vi.fn().mockResolvedValue({ status: "success" }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import type { PerfumeDetail as PerfumeDetailData } from "@/features/perfumes/types";

import { PerfumeDetail } from "./perfume-detail";

const perfume: PerfumeDetailData = {
  id: "essencial",
  brand: "Natura",
  name: "Essencial",
  description: "Uma fragrância amadeirada de presença elegante.",
  concentration: "eau_de_parfum",
  bottleFormat: "full_bottle",
  inspirationKind: "inspiration",
  inspiredBy: "Referencia classica",
  olfactoryFamilies: ["Amadeirado", "Especiado"],
  imageUrl: null,
  imagePath: null,
  imageSourceUrl: null,
  descriptionSourceUrls: [],
  isFavorite: false,
  launchYear: 2024,
  categoryType: "designer",
  audience: "unisex",
  intensity: 0,
  sweetness: null,
  freshness: 64,
  elegance: null,
  sensuality: null,
  profileTags: ["Assinatura"],
  notes: {
    top: ["Bergamota", "Pimenta rosa"],
    heart: ["Cedro"],
    base: ["Ambar", "Patchouli"],
  },
  scores: [
    { category: "performance", metricKey: "fixacao", score: 85 },
    { category: "performance", metricKey: "projecao", score: 70 },
    { category: "performance", metricKey: "presenca", score: 0 },
    { category: "accord", metricKey: "caramelo", score: 82 },
    { category: "accord", metricKey: "citrico", score: 96 },
    { category: "season", metricKey: "verao", score: 45 },
    { category: "occasion", metricKey: "formal", score: 90 },
    { category: "time", metricKey: "noite", score: 95 },
    { category: "environment", metricKey: "fechado", score: 55 },
  ],
  createdAt: "2026-07-26T10:00:00.000Z",
  updatedAt: "2026-07-26T11:00:00.000Z",
};

describe("PerfumeDetail", () => {
  beforeEach(() => {
    vi.setSystemTime(new Date("2026-07-21T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders identity and explanation without administrative actions or olfactory family chips", () => {
    render(<PerfumeDetail perfume={perfume} />);

    expect(screen.getByRole("link", { name: /Voltar para a cole/ })).toHaveAttribute(
      "href",
      "/colecao"
    );
    expect(screen.getByRole("heading", { level: 1, name: "Essencial" })).toBeInTheDocument();
    expect(screen.getByText(perfume.description)).toBeInTheDocument();
    expect(screen.queryByText("Amadeirado")).not.toBeInTheDocument();
    expect(screen.queryByText("Especiado")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Famílias olfativas")).not.toBeInTheDocument();
    const essential = screen.getByLabelText("Informações essenciais");
    expect(within(essential).getByText("Eau de Parfum (EDP)")).toBeInTheDocument();
    expect(within(essential).getByText("Designer")).toBeInTheDocument();
    expect(within(essential).getByText("Inspiração")).toBeInTheDocument();
    expect(within(essential).getByText("Referencia classica")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Editar perfume" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /favor/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /excluir/i })).not.toBeInTheDocument();
  });

  it("can point the back action to the recommender flow", () => {
    render(
      <PerfumeDetail
        perfume={perfume}
        backHref="/recomendador"
        backLabel="Voltar ao Recomendador"
      />
    );

    expect(screen.getByRole("link", { name: "Voltar ao Recomendador" })).toHaveAttribute(
      "href",
      "/recomendador"
    );
  });

  it("keeps all identity metadata in the hero without a technical section", () => {
    render(<PerfumeDetail perfume={perfume} />);

    const essential = screen.getByLabelText("Informações essenciais");

    expect(screen.queryByRole("heading", { name: "Informações técnicas" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Resumo do perfil")).not.toBeInTheDocument();
    expect(within(essential).getByText("2024")).toBeInTheDocument();
    expect(within(essential).getByText("Unissex")).toBeInTheDocument();
    expect(within(essential).queryByText("Formato na estante")).not.toBeInTheDocument();
    expect(within(essential).queryByText("Frasco")).not.toBeInTheDocument();
    expect(screen.queryByText("Tags de perfil")).not.toBeInTheDocument();
    expect(screen.queryByText("Assinatura")).not.toBeInTheDocument();
  });

  it("renders the olfactory pyramid as three semantic compact note groups", () => {
    render(<PerfumeDetail perfume={perfume} />);

    expect(screen.getByRole("heading", { name: "Notas de saída" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Notas de coração" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Notas de fundo" })).toBeInTheDocument();
    expect(screen.getByText("Bergamota")).toBeInTheDocument();
    expect(screen.getByText("Cedro")).toBeInTheDocument();
    expect(screen.getByText("Patchouli")).toBeInTheDocument();
  });

  it("renders main accords sorted by score with visible values", () => {
    render(<PerfumeDetail perfume={perfume} />);

    const accordRows = screen.getAllByLabelText(/%$/).filter((row) =>
      row.getAttribute("aria-label")?.match(/Citrico|Caramelo/),
    );

    expect(screen.getByRole("heading", { name: "Principais acordes" })).toBeInTheDocument();
    expect(accordRows.map((row) => row.getAttribute("aria-label"))).toEqual([
      "Citrico: 96%",
      "Caramelo: 82%",
    ]);
    expect(screen.getByText("96%")).toBeInTheDocument();
    expect(screen.getByText("82%")).toBeInTheDocument();
  });

  it("uses horizontal performance bars and keeps zero distinct from missing values", () => {
    render(<PerfumeDetail perfume={perfume} />);

    expect(
      screen.queryByRole("img", { name: "Gráfico de desempenho da fragrância" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Perfil da fragrância" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Perfil sensorial" })).toBeInTheDocument();
    expect(screen.getByLabelText("Métricas de desempenho")).toBeInTheDocument();
    expect(screen.getByLabelText("Perfil sensorial")).toBeInTheDocument();
    expect(screen.getByText("Fixação: 85%")).toBeInTheDocument();
    expect(screen.getByText("Presença: 0%")).toBeInTheDocument();
    expect(screen.getByText("Intensidade: 0%")).toBeInTheDocument();
    expect(screen.getByText("Rastro: Não informado")).toBeInTheDocument();
    expect(screen.getByText("Docura: Não informado")).toBeInTheDocument();
  });

  it("keeps season, occasion, and time metrics separate from performance", () => {
    render(<PerfumeDetail perfume={perfume} />);

    expect(screen.getByRole("heading", { name: "Perfil da fragrância" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ocasiões ideais" })).toBeInTheDocument();
    expect(screen.getByText("Verão: 45%")).toBeInTheDocument();
    expect(screen.getByText("Inverno: Não informado")).toBeInTheDocument();
    expect(screen.getByText("Academia: Não informado")).toBeInTheDocument();
    expect(screen.getByText("Formal: 90%")).toBeInTheDocument();
    expect(screen.getByText("Trabalho: Não informado")).toBeInTheDocument();
    expect(screen.getByText("Noite: 95%")).toBeInTheDocument();
    expect(screen.getByText("Dia Inteiro: Não informado")).toBeInTheDocument();
    expect(screen.getByText("Fechado: 55%")).toBeInTheDocument();
  });

  it("renders a richer journey summary with real percentages and accessible satisfaction", () => {
    render(
      <PerfumeDetail
        perfume={perfume}
        journeySummary={{
          usageCount: 3,
          lastUsedAt: "2026-07-19T15:30:00.000Z",
          averageSatisfaction: 3.5,
          complimentsCount: 2,
          frequentOccasion: "ar_livre",
          occasionCounts: { ar_livre: 2, formal: 1 },
          favoriteMoment: "tarde",
          momentCounts: { tarde: 2, noite: 1 },
        }}
      />
    );

    const journey = screen.getByLabelText("Resumo da jornada desta fragrância");

    expect(screen.getByText("MEMÓRIA OLFATIVA")).toBeInTheDocument();
    expect(within(journey).getByText("USOS REGISTRADOS")).toBeInTheDocument();
    expect(within(journey).getByText("3")).toBeInTheDocument();
    expect(within(journey).getByText("ÚLTIMO USO")).toBeInTheDocument();
    expect(within(journey).getByText("19/07/2026")).toBeInTheDocument();
    expect(within(journey).getByText("Há 2 dias")).toBeInTheDocument();
    expect(within(journey).getByText("SATISFAÇÃO MÉDIA")).toBeInTheDocument();
    expect(within(journey).getByText("3,5/5")).toBeInTheDocument();
    expect(within(journey).getByLabelText("Satisfação média: 3,5 de 5")).toBeInTheDocument();
    expect(within(journey).getByText("ELOGIOS RECEBIDOS")).toBeInTheDocument();
    expect(within(journey).getByText("Total")).toBeInTheDocument();
    expect(within(journey).getByText("OCASIÃO MAIS FREQUENTE")).toBeInTheDocument();
    expect(within(journey).getByText("Ar livre")).toBeInTheDocument();
    expect(within(journey).getAllByText("67%")).toHaveLength(2);
    expect(within(journey).getByText("MOMENTO FAVORITO")).toBeInTheDocument();
    expect(within(journey).getByText("Tarde")).toBeInTheDocument();
    expect(within(journey).getByText("Continue registrando seus usos para revelar ainda mais insights sobre seus hábitos e preferências.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver na Jornada" })).toHaveAttribute(
      "href",
      "/jornada?q=Essencial"
    );
    expect(screen.queryByText("Sobre estas metricas")).not.toBeInTheDocument();
  });

  it("keeps single-use journey percentages honest", () => {
    render(
      <PerfumeDetail
        perfume={perfume}
        journeySummary={{
          usageCount: 1,
          lastUsedAt: "2026-07-19T21:30:00.000Z",
          averageSatisfaction: 3,
          complimentsCount: 0,
          frequentOccasion: "casual",
          occasionCounts: { casual: 1 },
          favoriteMoment: "noite",
          momentCounts: { noite: 1 },
        }}
      />
    );

    const journey = screen.getByLabelText("Resumo da jornada desta fragrância");
    expect(within(journey).getByText("3,0/5")).toBeInTheDocument();
    expect(within(journey).getByText("Casual")).toBeInTheDocument();
    expect(within(journey).getByText("Noite")).toBeInTheDocument();
    expect(within(journey).getAllByText("100%")).toHaveLength(2);
  });

  it("uses neutral states for missing journey dimensions", () => {
    render(
      <PerfumeDetail
        perfume={perfume}
        journeySummary={{
          usageCount: 2,
          lastUsedAt: null,
          averageSatisfaction: null,
          complimentsCount: 0,
          frequentOccasion: null,
          occasionCounts: {},
          favoriteMoment: null,
          momentCounts: {},
        }}
      />
    );

    const journey = screen.getByLabelText("Resumo da jornada desta fragrância");
    expect(within(journey).getByText("Não informado")).toBeInTheDocument();
    expect(within(journey).getByText("Sem avaliação")).toBeInTheDocument();
    expect(within(journey).getByLabelText("Satisfação média ainda sem dados")).toBeInTheDocument();
    expect(within(journey).getAllByText("Ainda sem dados")).toHaveLength(2);
    expect(within(journey).queryByText("0%")).not.toBeInTheDocument();
  });

  it("keeps the first-use state compact when there is no journey history", () => {
    render(<PerfumeDetail perfume={perfume} />);

    expect(screen.getByText("Registre o primeiro uso para construir esta memória.")).toBeInTheDocument();
    expect(screen.queryByLabelText("Resumo da jornada desta fragrância")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Ver na Jornada" })).not.toBeInTheDocument();
  });
});
