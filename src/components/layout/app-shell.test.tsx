import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { pathnameMock } = vi.hoisted(() => ({ pathnameMock: vi.fn() }));

vi.mock("next/navigation", () => ({ usePathname: pathnameMock }));
vi.mock("@/app/(app)/actions", () => ({ logoutAction: vi.fn() }));

import { AppShell } from "./app-shell";

describe("AppShell", () => {
  beforeEach(() => pathnameMock.mockReturnValue("/recomendador"));

  it("renders the approved navigation and current route", () => {
    render(
      <AppShell profile={{ displayName: "Leonardo" }} user={{ email: "leo@example.com" }}>
        <h1>Conteúdo</h1>
      </AppShell>,
    );

    expect(screen.getAllByRole("link", { name: "Visão geral" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Minha coleção" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Recomendador" })[0]).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getAllByRole("link", { name: "Diário de uso" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Análises" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Abrir menu" })).toBeInTheDocument();
  });

  it("exposes profile editing and logout from the account menu", async () => {
    const user = userEvent.setup();
    render(
      <AppShell profile={{ displayName: "Leonardo" }} user={{ email: "leo@example.com" }}>
        <h1>Conteúdo</h1>
      </AppShell>,
    );

    await user.click(screen.getByRole("button", { name: "Minha conta" }));

    expect(screen.getByRole("menuitem", { name: "Editar perfil" })).toHaveAttribute(
      "href",
      "/perfil",
    );
    expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument();
  });

  it("marks a new module as active on nested routes", () => {
    pathnameMock.mockReturnValue("/diario/registro");

    render(
      <AppShell profile={{ displayName: "Leonardo" }} user={{ email: "leo@example.com" }}>
        <h1>Conteúdo</h1>
      </AppShell>,
    );

    expect(screen.getByRole("link", { name: "Diário de uso" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Visão geral" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("traps the mobile menu flow and restores trigger focus on Escape", async () => {
    const user = userEvent.setup();
    render(
      <AppShell profile={{ displayName: "Leonardo" }} user={{ email: "leo@example.com" }}>
        <h1>Conteúdo</h1>
      </AppShell>,
    );
    const trigger = screen.getByRole("button", { name: "Abrir menu" });

    await user.click(trigger);
    expect(screen.getByRole("dialog", { name: "Menu principal" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Diário de uso" })).toHaveLength(2);
    expect(document.body.style.overflow).toBe("hidden");

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Menu principal" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
