import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  formatOptionalText,
  formatPercent,
  validatePercent,
} from "@/features/perfumes/constants";

import {
  EmptyMetricState,
  MetadataChip,
  PercentageBar,
  PercentageField,
  TagInput,
} from "./ui-primitives";

describe("collection UI primitives", () => {
  it("formats zero as 0% and null as Não informado", () => {
    expect(formatPercent(0)).toBe("0%");
    expect(formatPercent(null)).toBe("Não informado");
    expect(formatOptionalText(null)).toBe("Não informado");
  });

  it("validates percentage values from 0 to 100", () => {
    expect(validatePercent("0")).toBeNull();
    expect(validatePercent("100")).toBeNull();
    expect(validatePercent("101")).toBe("Informe um valor de 0 a 100.");
    expect(validatePercent("-1")).toBe("Informe um valor de 0 a 100.");
    expect(validatePercent("")).toBeNull();
  });

  it("renders an accessible progressbar for informed values", () => {
    render(<PercentageBar label="Intensidade" value={0} />);

    const progressbar = screen.getByRole("progressbar", { name: "Intensidade: 0%" });
    expect(progressbar).toHaveAttribute("aria-valuenow", "0");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
  });

  it("renders a clear empty state for null metrics", () => {
    render(<EmptyMetricState label="Doçura" />);

    expect(screen.getByText("Doçura")).toBeInTheDocument();
    expect(screen.getByText("Não informado")).toBeInTheDocument();
  });

  it("shows labels, errors, and focusable percentage inputs", () => {
    render(
      <PercentageField
        label="Frescor"
        name="freshness"
        value={50}
        error="Informe um valor de 0 a 100."
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Frescor (%)")).toHaveAttribute("min", "0");
    expect(screen.getByLabelText("Frescor (%)")).toHaveAttribute("max", "100");
    expect(screen.getByLabelText("Frescor (%)")).toHaveAttribute("inputmode", "numeric");
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("Informe um valor de 0 a 100.")).toBeInTheDocument();
  });

  it("keeps null, zero, and one hundred visually distinct in percentage fields", () => {
    const { rerender } = render(
      <PercentageField label="Rastro" name="performance-rastro" value={null} onChange={vi.fn()} />,
    );

    expect(screen.getByLabelText("Rastro (%)")).toHaveValue(null);
    expect(screen.getByText("Não informado")).toBeInTheDocument();

    rerender(
      <PercentageField label="Rastro" name="performance-rastro" value={0} onChange={vi.fn()} />,
    );
    expect(screen.getByLabelText("Rastro (%)")).toHaveValue(0);
    expect(screen.getByText("0%")).toBeInTheDocument();

    rerender(
      <PercentageField label="Rastro" name="performance-rastro" value={100} onChange={vi.fn()} />,
    );
    expect(screen.getByLabelText("Rastro (%)")).toHaveValue(100);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("adds tags without duplicates and removes individual tags", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TagInput
        label="Perfil"
        name="profileTags"
        value={["Noturno"]}
        onChange={onChange}
      />,
    );

    await user.type(screen.getByLabelText("Perfil"), "Noturno{Enter}");
    expect(onChange).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText("Perfil"));
    await user.type(screen.getByLabelText("Perfil"), "Elegante{Enter}");
    expect(onChange).toHaveBeenLastCalledWith(["Noturno", "Elegante"]);

    await user.click(screen.getByRole("button", { name: "Remover Noturno" }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("renders metadata chips with fallback text", () => {
    render(<MetadataChip label="Categoria" value={null} />);

    expect(screen.getByText("Categoria")).toBeInTheDocument();
    expect(screen.getByText("Não informado")).toBeInTheDocument();
  });
});
