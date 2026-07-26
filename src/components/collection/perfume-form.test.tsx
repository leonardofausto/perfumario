import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/perfumes/actions", () => ({
  createPerfumeAction: vi.fn().mockResolvedValue({ status: "idle" }),
  updatePerfumeAction: vi.fn().mockResolvedValue({ status: "idle" }),
}));

import type { PerfumeDetail } from "@/features/perfumes/types";

import { PerfumeForm } from "./perfume-form";

const perfume: PerfumeDetail = {
  id: "owned",
  brand: "Natura",
  name: "Essencial",
  description: "Descrição existente",
  concentration: "eau_de_parfum",
  bottleFormat: "decant",
  inspirationKind: "inspiration",
  inspiredBy: "Referência",
  olfactoryFamilies: ["Amadeirado"],
  imageUrl: null,
  imagePath: null,
  imageSourceUrl: null,
  descriptionSourceUrls: [],
  isFavorite: false,
  notes: { top: ["Limão"], heart: ["Cedro"], base: ["Âmbar"] },
  scores: [{ category: "performance", metricKey: "fixacao", score: 80 }],
  createdAt: "2026-07-26T10:00:00.000Z",
  updatedAt: "2026-07-26T10:00:00.000Z",
};

describe("PerfumeForm", () => {
  it("renders blank create defaults and every structured section", () => {
    render(<PerfumeForm />);

    expect(screen.getByRole("heading", { name: "Adicionar perfume" })).toBeInTheDocument();
    expect(screen.getByLabelText("Marca")).toHaveValue("");
    expect(screen.getByLabelText("Formato na estante")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Pirâmide olfativa" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Desempenho" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Clima e estações" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Ocasiões" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Horários" })).toBeInTheDocument();
  });

  it("loads edit values and keeps bottle format independent from concentration", () => {
    render(<PerfumeForm perfume={perfume} />);

    expect(screen.getByRole("heading", { name: "Editar Essencial" })).toBeInTheDocument();
    expect(screen.getByLabelText("Marca")).toHaveValue("Natura");
    expect(screen.getByLabelText("Concentração")).toHaveValue("eau_de_parfum");
    expect(screen.getByLabelText("Formato na estante")).toHaveValue("decant");
    expect(screen.getByLabelText("Notas de saída")).toHaveValue("Limão");
    expect(screen.getByLabelText("Fixação (%)")).toHaveValue(80);
  });

  it("shows the reference field only for dupe or inspiration", async () => {
    const user = userEvent.setup();
    render(<PerfumeForm />);

    expect(screen.queryByLabelText("Perfume de referência")).toBeNull();
    await user.selectOptions(screen.getByLabelText("Relação com outra fragrância"), "dupe");
    expect(screen.getByLabelText("Perfume de referência")).toBeRequired();
  });

  it("limits manual cover upload to the normalized WebP format", () => {
    render(<PerfumeForm />);
    expect(screen.getByLabelText("Imagem do perfume")).toHaveAttribute(
      "accept",
      "image/webp",
    );
  });
});
