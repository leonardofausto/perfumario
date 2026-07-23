import type { ImgHTMLAttributes } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt ?? ""} {...props} />
  ),
}));

import { AuthShell } from "./auth-shell";

describe("AuthShell", () => {
  it("presents the approved photographic login composition", () => {
    render(
      <AuthShell>
        <form aria-label="Entrar na sua estante" />
      </AuthShell>,
    );

    expect(
      screen.getByRole("img", { name: "Coleção de perfumes em uma estante" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Sua estante, sua história.")).toBeInTheDocument();
    expect(screen.getByRole("form", { name: "Entrar na sua estante" })).toBeInTheDocument();
  });
});
