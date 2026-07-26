import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { PerfumeSummary } from "@/features/perfumes/types";

import { RecommenderView } from "./recommender-view";

const perfumes: PerfumeSummary[] = [
  {
    id: "one",
    brand: "Marca",
    name: "Persistido",
    concentration: "other",
    bottleFormat: "full_bottle",
    inspirationKind: "original",
    inspiredBy: null,
    olfactoryFamilies: ["Não catalogada"],
    imageUrl: null,
    isFavorite: false,
  },
];

describe("RecommenderView", () => {
  it("uses only server-provided collection candidates", async () => {
    const user = userEvent.setup();
    render(<RecommenderView perfumes={perfumes} />);

    await user.click(screen.getByRole("button", { name: "Revelar meu Top 3" }));
    expect(screen.getByText("Persistido")).toBeInTheDocument();
    expect(screen.queryByText("Armaf Odyssey Mandarin Sky")).toBeNull();
  });

  it("shows an honest message when the persisted collection is empty", async () => {
    const user = userEvent.setup();
    render(<RecommenderView perfumes={[]} />);

    await user.click(screen.getByRole("button", { name: "Revelar meu Top 3" }));
    expect(screen.getByText("Sua coleção ainda não tem perfumes.")).toBeInTheDocument();
  });
});
