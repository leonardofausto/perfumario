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
    name: "Ambar",
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
    inspiredBy: "Referencia",
    olfactoryFamilies: ["Citrico"],
    imageUrl: "https://signed.example/brisa.webp",
    isFavorite: true,
  },
];

function makePerfume(index: number): PerfumeSummary {
  return {
    id: `perfume-${index}`,
    brand: index % 2 === 0 ? "Alfa" : "Beta",
    name: `Perfume ${index.toString().padStart(2, "0")}`,
    concentration: "eau_de_parfum",
    bottleFormat: "full_bottle",
    inspirationKind: "original",
    inspiredBy: null,
    olfactoryFamilies: ["Amadeirado"],
    imageUrl: null,
    isFavorite: false,
  };
}

describe("CollectionView", () => {
  it("renders the same header structure used by the other workspace menus", () => {
    render(<CollectionView perfumes={perfumes} />);

    expect(screen.getByText("Estante particular")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Minha Coleção" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Sua biblioteca de fragrâncias, organizada para consultar cada detalhe.",
      ),
    ).toBeInTheDocument();
  });

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

    await user.click(screen.getByRole("button", { name: "Adicionar Ambar aos favoritos" }));

    expect(mocks.toggleFavoriteAction).toHaveBeenCalledWith("amber", true);
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("filters the gallery by search, favorite status, and brand", async () => {
    const user = userEvent.setup();
    render(<CollectionView perfumes={perfumes} />);

    expect(screen.getByText("2 perfumes")).toBeInTheDocument();
    await user.type(screen.getByRole("searchbox", { name: "Buscar na coleção" }), "brisa");
    expect(screen.getByRole("link", { name: /ver detalhes de brisa/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /ver detalhes de ambar/i })).toBeNull();

    await user.clear(screen.getByRole("searchbox", { name: "Buscar na coleção" }));
    await user.selectOptions(screen.getByLabelText("Exibir perfumes"), "favorites");
    expect(screen.queryByRole("link", { name: /ver detalhes de ambar/i })).toBeNull();

    await user.selectOptions(screen.getByLabelText("Exibir perfumes"), "all");
    await user.selectOptions(screen.getByLabelText("Filtrar por marca"), "Zeta");
    expect(screen.getByRole("link", { name: /ver detalhes de ambar/i })).toBeInTheDocument();
    expect(screen.queryByText("Eau de toilette")).toBeNull();
    expect(screen.queryByText("Decant")).toBeNull();
  });

  it("paginates filtered perfumes from an initial page size of 25", async () => {
    const user = userEvent.setup();
    const manyPerfumes = Array.from({ length: 31 }, (_, index) => makePerfume(index + 1));

    render(<CollectionView perfumes={manyPerfumes} />);

    expect(screen.getAllByRole("link", { name: /ver detalhes/i })).toHaveLength(25);
    expect(screen.getByText("1-25 de 31 perfumes")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Próxima página" }));
    expect(screen.getAllByRole("link", { name: /ver detalhes/i })).toHaveLength(6);
    expect(screen.getByText("26-31 de 31 perfumes")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Perfumes por página"), "50");
    expect(screen.getAllByRole("link", { name: /ver detalhes/i })).toHaveLength(31);
    expect(screen.getByText("1-31 de 31 perfumes")).toBeInTheDocument();
  });

  it("shows a truthful empty state and the dedicated add route", () => {
    render(<CollectionView perfumes={[]} />);

    expect(screen.getByText(/Sua estante ainda est/)).toBeInTheDocument();
    for (const link of screen.getAllByRole("link", { name: "Adicionar perfume" })) {
      expect(link).toHaveAttribute("href", "/colecao/novo");
    }
  });
});
