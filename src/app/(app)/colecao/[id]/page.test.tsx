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
}));

import PerfumeDetailPage from "./page";

describe("PerfumeDetailPage", () => {
  it("uses notFound for a missing or foreign perfume", async () => {
    mocks.getOwnPerfume.mockResolvedValue(null);

    await expect(
      PerfumeDetailPage({ params: Promise.resolve({ id: "foreign" }) }),
    ).rejects.toThrow("NOT_FOUND");
  });

  it("renders the owned perfume", async () => {
    mocks.getOwnPerfume.mockResolvedValue({
      id: "owned",
      brand: "Marca",
      name: "Perfume próprio",
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
      notes: { top: ["Limão"], heart: ["Rosa"], base: ["Almíscar"] },
      scores: [],
      createdAt: "2026-07-26T10:00:00.000Z",
      updatedAt: "2026-07-26T10:00:00.000Z",
    });

    render(await PerfumeDetailPage({ params: Promise.resolve({ id: "owned" }) }));
    expect(screen.getByRole("heading", { level: 1, name: "Perfume próprio" })).toBeInTheDocument();
  });
});
