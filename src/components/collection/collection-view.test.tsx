import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  toggleFavoriteAction: vi.fn().mockResolvedValue({ status: "success" }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));
vi.mock("@/features/perfumes/actions", () => ({
  toggleFavoriteAction: mocks.toggleFavoriteAction,
}));

import type { PerfumeSummary } from "@/features/perfumes/types";

import { CollectionView } from "./collection-view";

const perfumes: PerfumeSummary[] = [
  {
    id: "amber",
    brand: "Zeta",
    name: "Âmbar",
    concentration: "eau_de_parfum",
    bottleFormat: "full_bottle",
    inspirationKind: "original",
    inspiredBy: null,
    olfactoryFamilies: ["Amadeirado"],
    imageUrl: null,
    isFavorite: false,
  },
  {
    id: "brisa",
    brand: "Alfa",
    name: "Brisa",
    concentration: "eau_de_toilette",
    bottleFormat: "decant",
    inspirationKind: "inspiration",
    inspiredBy: "Referência",
    olfactoryFamilies: ["Cítrico"],
    imageUrl: "https://signed.example/brisa.webp",
    isFavorite: true,
  },
];

describe("CollectionView", () => {
  it("links cards to details and keeps favorites first", () => {
    render(<CollectionView perfumes={perfumes} />);

    const links = screen.getAllByRole("link", { name: /ver detalhes/i });
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/colecao/brisa",
      "/colecao/amber",
    ]);
    expect(screen.queryByRole("button", { name: /editar perfume/i })).toBeNull();
  });

  it("favorites without navigating through the card link", async () => {
    const user = userEvent.setup();
    render(<CollectionView perfumes={perfumes} />);

    await user.click(screen.getByRole("button", { name: "Adicionar Âmbar aos favoritos" }));

    expect(mocks.toggleFavoriteAction).toHaveBeenCalledWith("amber", true);
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("filters by search, favorite status, and brand", async () => {
    const user = userEvent.setup();
    render(<CollectionView perfumes={perfumes} />);

    await user.type(screen.getByRole("searchbox"), "brisa");
    expect(screen.getByRole("link", { name: /ver detalhes de brisa/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /ver detalhes de âmbar/i })).toBeNull();

    await user.clear(screen.getByRole("searchbox"));
    await user.selectOptions(screen.getByLabelText("Exibir perfumes"), "favorites");
    expect(screen.queryByRole("link", { name: /ver detalhes de âmbar/i })).toBeNull();

    await user.selectOptions(screen.getByLabelText("Exibir perfumes"), "all");
    await user.selectOptions(screen.getByLabelText("Filtrar por marca"), "Zeta");
    expect(screen.getByRole("link", { name: /ver detalhes de âmbar/i })).toBeInTheDocument();
  });

  it("shows a truthful empty state and the dedicated add route", () => {
    render(<CollectionView perfumes={[]} />);

    expect(screen.getByText("Sua estante ainda está vazia.")).toBeInTheDocument();
    for (const link of screen.getAllByRole("link", { name: "Adicionar perfume" })) {
      expect(link).toHaveAttribute("href", "/colecao/novo");
    }
  });
});
