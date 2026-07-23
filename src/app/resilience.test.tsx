import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ErrorPage from "./error";
import Loading from "./loading";
import NotFound from "./not-found";

describe("application resilience states", () => {
  it("offers retry after an unexpected error", () => {
    const reset = vi.fn();
    render(<ErrorPage error={new Error("failure")} reset={reset} />);

    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(reset).toHaveBeenCalledOnce();
  });

  it("links a missing route back home", () => {
    render(<NotFound />);

    expect(screen.getByRole("link", { name: "Voltar ao início" })).toHaveAttribute("href", "/");
  });

  it("announces loading status", () => {
    render(<Loading />);

    expect(screen.getByRole("status")).toHaveTextContent("Carregando sua estante");
  });
});
