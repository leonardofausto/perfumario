import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  deletePerfumeAction: vi.fn().mockResolvedValue({ status: "success" }),
}));

vi.mock("@/features/perfumes/actions", () => ({
  deletePerfumeAction: mocks.deletePerfumeAction,
}));

import { DeletePerfumeButton } from "./delete-perfume-button";

describe("DeletePerfumeButton", () => {
  it("requires explicit confirmation and allows cancellation", async () => {
    const user = userEvent.setup();
    render(<DeletePerfumeButton id="perfume-1" name="Essencial" />);

    await user.click(screen.getByRole("button", { name: "Excluir perfume" }));
    expect(
      screen.getByRole("dialog", { name: "Excluir fragrância?" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Essencial")).toBeInTheDocument();
    expect(
      screen.getByText("Esta ação é permanente e não poderá ser desfeita."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(mocks.deletePerfumeAction).not.toHaveBeenCalled();
  });

  it("deletes only after confirmation", async () => {
    const user = userEvent.setup();
    render(<DeletePerfumeButton id="perfume-1" name="Essencial" />);

    await user.click(screen.getByRole("button", { name: "Excluir perfume" }));
    await user.click(screen.getByRole("button", { name: "Confirmar exclusão" }));

    expect(mocks.deletePerfumeAction).toHaveBeenCalledWith("perfume-1");
  });
});
