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
      "/colecao",
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
  });

  it("can point the back action to the recommender flow", () => {
    render(
      <PerfumeDetail
        perfume={perfume}
        backHref="/recomendador"
        backLabel="Voltar ao Recomendador"
      />,
    );

    expect(screen.getByRole("link", { name: "Voltar ao Recomendador" })).toHaveAttribute(
      "href",
      "/recomendador",
    );
  });

  it("does not show level and replenishment tracking in perfume details", () => {
    render(<PerfumeDetail perfume={perfume} />);

    expect(screen.queryByRole("region", { name: "Nível e reposição" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Salvar acompanhamento" })).toBeNull();
  });
});
