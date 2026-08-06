import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getOwnPerfume: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
}));

vi.mock("@/features/perfumes/queries", () => ({
  getOwnPerfume: mocks.getOwnPerfume,
}));
vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
  useRouter: () => ({ refresh: vi.fn() }),
}));
vi.mock("@/features/perfumes/actions", () => ({
  toggleFavoriteAction: vi.fn(),
  updateContainerStatusAction: vi.fn().mockResolvedValue({ status: "success" }),
}));

import PerfumeDetailPage from "./page";

describe("PerfumeDetailPage", () => {
  it("uses notFound for a missing or foreign perfume", async () => {
    mocks.getOwnPerfume.mockResolvedValue(null);

    await expect(
      PerfumeDetailPage({ params: Promise.resolve({ id: "foreign" }) }),
    ).rejects.toThrow("NOT_FOUND");
  });

  it("renders an owned legacy perfume without remodel-only arrays", async () => {
    mocks.getOwnPerfume.mockResolvedValue({
      id: "owned",
      brand: "Marca",
      name: "Perfume proprio",
      description: "Descrição",
      concentration: "eau_de_parfum",
      bottleFormat: "decant",
      inspirationKind: "original",
      inspiredBy: null,
      olfactoryFamilies: ["Floral"],
      imageUrl: null,
      imagePath: null,
      imageSourceUrl: null,
      descriptionSourceUrls: [],
      isFavorite: false,
      launchYear: null,
      categoryType: null,
      audience: null,
      intensity: null,
      sweetness: null,
      freshness: null,
      elegance: null,
      sensuality: null,
      notes: { top: ["Limao"], heart: ["Rosa"], base: ["Almiscar"] },
      scores: [],
      createdAt: "2026-07-26T10:00:00.000Z",
      updatedAt: "2026-07-26T10:00:00.000Z",
    });

    render(await PerfumeDetailPage({ params: Promise.resolve({ id: "owned" }) }));

    expect(screen.getByRole("heading", { level: 1, name: "Perfume proprio" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Resumo do perfil")).not.toBeInTheDocument();
  });

  it("uses the recommender return action when opened from ranking", async () => {
    mocks.getOwnPerfume.mockResolvedValue({
      id: "owned",
      brand: "Marca",
      name: "Perfume proprio",
      description: "DescriÃ§Ã£o",
      concentration: "eau_de_parfum",
      bottleFormat: "decant",
      inspirationKind: "original",
      inspiredBy: null,
      olfactoryFamilies: ["Floral"],
      imageUrl: null,
      imagePath: null,
      imageSourceUrl: null,
      descriptionSourceUrls: [],
      isFavorite: false,
      launchYear: null,
      categoryType: null,
      audience: null,
      intensity: null,
      sweetness: null,
      freshness: null,
      elegance: null,
      sensuality: null,
      profileTags: [],
      notes: { top: ["Limao"], heart: ["Rosa"], base: ["Almiscar"] },
      scores: [],
      createdAt: "2026-07-26T10:00:00.000Z",
      updatedAt: "2026-07-26T10:00:00.000Z",
    });

    render(
      await PerfumeDetailPage({
        params: Promise.resolve({ id: "owned" }),
        searchParams: Promise.resolve({ from: "recomendador" }),
      })
    );

    expect(screen.getByRole("link", { name: "Voltar ao Recomendador" })).toHaveAttribute(
      "href",
      "/recomendador"
    );
  });
});
