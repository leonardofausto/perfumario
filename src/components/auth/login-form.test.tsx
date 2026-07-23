import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/(auth)/actions", () => ({
  loginAction: vi.fn().mockResolvedValue({ status: "idle" }),
}));

import { LoginForm } from "./login-form";

describe("LoginForm", () => {
  it("offers only private email and password authentication", () => {
    render(<LoginForm />);

    expect(screen.getByRole("form", { name: "Entrar na sua estante" })).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Esqueci minha senha" })).toBeInTheDocument();
    expect(screen.queryByText(/google/i)).not.toBeInTheDocument();
  });
});
