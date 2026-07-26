import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getOwnPerfumeDashboard } = vi.hoisted(() => ({
  getOwnPerfumeDashboard: vi.fn(),
}));

vi.mock("@/features/perfumes/queries", () => ({ getOwnPerfumeDashboard }));

import DashboardPage from "./page";

describe("DashboardPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders persisted collection statistics and recent perfumes", async () => {
    getOwnPerfumeDashboard.mockResolvedValue({
      totalCount: 16,
      favoriteCount: 2,
      recent: [
        {
          id: "recent",
          brand: "ARMAF",
          name: "Odyssey",
          concentration: "eau_de_parfum",
          bottleFormat: "full_bottle",
          inspirationKind: "original",
          inspiredBy: null,
          olfactoryFamilies: ["Amadeirado"],
          imageUrl: null,
          isFavorite: true,
        },
      ],
    });

    render(await DashboardPage());

    expect(screen.getByText("16")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /odyssey/i })).toHaveAttribute(
      "href",
      "/colecao/recent",
    );
  });

  it("renders a truthful empty state from Supabase data", async () => {
    getOwnPerfumeDashboard.mockResolvedValue({
      totalCount: 0,
      favoriteCount: 0,
      recent: [],
    });

    render(await DashboardPage());
    expect(screen.getByText("Sua estante inteligente começa aqui")).toBeInTheDocument();
  });
});
