import { LibraryBig } from "lucide-react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders accessible guidance and an optional action", () => {
    const { container } = render(
      <EmptyState
        action={{ href: "/colecao", label: "Ir para coleção" }}
        description="Cadastre seu primeiro perfume."
        icon={LibraryBig}
        title="Sua estante está pronta"
      />,
    );

    expect(screen.getByRole("heading", { name: "Sua estante está pronta" })).toBeInTheDocument();
    expect(screen.getByText("Cadastre seu primeiro perfume.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir para coleção" })).toHaveAttribute(
      "href",
      "/colecao",
    );
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});
