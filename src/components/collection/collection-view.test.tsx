import { render, screen, within } from "@testing-library/react";
import { createElement } from "react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  deletePerfumeAction: vi.fn().mockResolvedValue({ status: "success" }),
  toggleFavoriteAction: vi.fn().mockResolvedValue({ status: "success" }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));
vi.mock("@/features/perfumes/actions", () => ({
  deletePerfumeAction: mocks.deletePerfumeAction,
  toggleFavoriteAction: mocks.toggleFavoriteAction,
}));
vi.mock("next/image", () => ({
  default: ({
    alt,
    priority,
    src,
  }: {
    alt: string;
    priority?: boolean;
    src: string;
  }) =>
    createElement("img", {
      alt,
      "data-priority": priority ? "true" : "false",
      src,
    }),
}));

import type { PerfumeSummary } from "@/features/perfumes/types";

import { CollectionView } from "./collection-view";

const remodelContract = {
  launchYear: null,
  categoryType: null,
  audience: null,
  intensity: null,
  sweetness: null,
  freshness: null,
  elegance: null,
  sensuality: null,
  profileTags: [],
};

const perfumes: PerfumeSummary[] = [
  {
    ...remodelContract,
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
    ...remodelContract,
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
    ...remodelContract,
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

function makePerfumeWithImage(index: number): PerfumeSummary {
  return {
    ...makePerfume(index),
    imageUrl: `https://signed.example/perfume-${index}.webp`,
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

  it("links cards to details, keeps favorites first, and exposes direct card management", () => {
    render(<CollectionView perfumes={perfumes} />);

    const links = screen.getAllByRole("link", { name: /ver detalhes/i });
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/colecao/brisa",
      "/colecao/amber",
    ]);
    expect(
      screen
        .getAllByRole("link", { name: /editar/i })
        .map((link) => link.getAttribute("href")),
    ).toEqual(["/colecao/brisa/editar", "/colecao/amber/editar"]);
    expect(screen.getAllByRole("button", { name: /excluir/i })).toHaveLength(2);
  });

  it("favorites without navigating through the card link", async () => {
    const user = userEvent.setup();
    render(<CollectionView perfumes={perfumes} />);

    await user.click(screen.getByRole("button", { name: "Adicionar Ambar aos favoritos" }));

    expect(mocks.toggleFavoriteAction).toHaveBeenCalledWith("amber", true);
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("deletes from the card action only after confirmation", async () => {
    const user = userEvent.setup();
    render(<CollectionView perfumes={perfumes} />);

    await user.click(screen.getByRole("button", { name: "Excluir Ambar" }));
    const dialog = screen.getByRole("dialog", { name: "Excluir fragrância?" });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText("Ambar")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirmar exclusão" }));

    expect(mocks.deletePerfumeAction).toHaveBeenCalledWith("amber");
  });

  it("filters the gallery by status and brand", async () => {
    const user = userEvent.setup();
    render(<CollectionView perfumes={perfumes} />);

    expect(screen.getByText("2 perfumes")).toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).toBeNull();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Marcas")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Filtrar por status"), "favorites");
    expect(screen.queryByRole("link", { name: /ver detalhes de ambar/i })).toBeNull();

    await user.selectOptions(screen.getByLabelText("Filtrar por status"), "all");
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

  it("prioritizes only the first above-the-fold gallery images", () => {
    const imagePerfumes = Array.from({ length: 6 }, (_, index) =>
      makePerfumeWithImage(index + 1),
    );

    render(<CollectionView perfumes={imagePerfumes} />);

    expect(
      screen
        .getAllByRole("img", { name: /frasco de perfume/i })
        .map((image) => image.getAttribute("data-priority")),
    ).toEqual(["true", "true", "true", "true", "false", "false"]);
  });

  it("shows a truthful empty state and the dedicated add route", () => {
    render(<CollectionView perfumes={[]} />);

    expect(screen.getByText(/Sua estante ainda est/)).toBeInTheDocument();
    for (const link of screen.getAllByRole("link", { name: "Adicionar perfume" })) {
      expect(link).toHaveAttribute("href", "/colecao/novo");
    }
  });
});
