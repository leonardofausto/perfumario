import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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
  inspiredBy: "Referência clássica",
  olfactoryFamilies: ["Amadeirado", "Especiado"],
  imageUrl: null,
  imagePath: null,
  imageSourceUrl: null,
  descriptionSourceUrls: [],
  isFavorite: false,
  notes: {
    top: ["Bergamota", "Pimenta rosa"],
    heart: ["Cedro"],
    base: ["Âmbar", "Patchouli"],
  },
  scores: [
    { category: "performance", metricKey: "fixacao", score: 85 },
    { category: "performance", metricKey: "projecao", score: 70 },
    { category: "season", metricKey: "verao", score: 45 },
    { category: "occasion", metricKey: "formal", score: 90 },
    { category: "time", metricKey: "noite", score: 95 },
  ],
  createdAt: "2026-07-26T10:00:00.000Z",
  updatedAt: "2026-07-26T11:00:00.000Z",
};

describe("PerfumeDetail", () => {
  it("renders identity, explanation, families, and dedicated edit action", () => {
    render(<PerfumeDetail perfume={perfume} />);

    expect(screen.getByRole("heading", { level: 1, name: "Essencial" })).toBeInTheDocument();
    expect(screen.getByText(perfume.description)).toBeInTheDocument();
    expect(screen.getByText("Amadeirado")).toBeInTheDocument();
    expect(screen.getByText("Especiado")).toBeInTheDocument();
    expect(screen.getByText("Inspiração de Referência clássica")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Editar perfume" })).toHaveAttribute(
      "href",
      "/colecao/essencial/editar",
    );
  });

  it("renders the olfactory pyramid as three semantic note groups", () => {
    render(<PerfumeDetail perfume={perfume} />);

    expect(screen.getByRole("heading", { name: "Notas de saída" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Notas de coração" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Notas de fundo" })).toBeInTheDocument();
    expect(screen.getByText("Bergamota")).toBeInTheDocument();
    expect(screen.getByText("Cedro")).toBeInTheDocument();
    expect(screen.getByText("Patchouli")).toBeInTheDocument();
  });

  it("provides textual values alongside the performance radar", () => {
    render(<PerfumeDetail perfume={perfume} />);

    expect(screen.getByRole("img", { name: "Gráfico de desempenho da fragrância" })).toBeInTheDocument();
    expect(screen.getByText("Fixação: 85%")).toBeInTheDocument();
    expect(screen.getByText("Projeção: 70%")).toBeInTheDocument();
    expect(screen.getByText("Rastro: Não informado")).toBeInTheDocument();
  });

  it("shows every season, occasion, and time metric with an explicit value", () => {
    render(<PerfumeDetail perfume={perfume} />);

    expect(screen.getByText("Verão: 45%")).toBeInTheDocument();
    expect(screen.getByText("Inverno: Não informado")).toBeInTheDocument();
    expect(screen.getByText("Formal: 90%")).toBeInTheDocument();
    expect(screen.getByText("Trabalho: Não informado")).toBeInTheDocument();
    expect(screen.getByText("Noite: 95%")).toBeInTheDocument();
    expect(screen.getByText("Manhã: Não informado")).toBeInTheDocument();
  });
});
