import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createUsageAction: vi.fn(),
  deleteUsageAction: vi.fn(),
  refresh: vi.fn(),
  updateUsageAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));
vi.mock("@/features/usage-log/actions", () => ({
  createUsageAction: mocks.createUsageAction,
  deleteUsageAction: mocks.deleteUsageAction,
  updateUsageAction: mocks.updateUsageAction,
}));
vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span aria-label={alt} role="img" />,
}));

import type { PerfumeSummary } from "@/features/perfumes/types";
import type { UsageRecord } from "@/features/usage-log/types";

import { UsageDiary } from "./usage-diary";

const perfume: PerfumeSummary = {
  id: "11111111-1111-4111-8111-111111111111",
  brand: "Natura",
  name: "Essencial",
  concentration: "eau_de_parfum",
  bottleFormat: "full_bottle",
  inspirationKind: "original",
  inspiredBy: null,
  olfactoryFamilies: ["Amadeirado"],
  imageUrl: null,
  isFavorite: false,
  launchYear: null,
  categoryType: null,
  audience: null,
  intensity: null,
  sweetness: null,
  freshness: null,
  elegance: null,
  sensuality: null,
  profileTags: [],
  containerLevel: "unknown",
  replenishmentIntent: null,
  containerLevelUpdatedAt: null,
};

const usage: UsageRecord = {
  id: "22222222-2222-4222-8222-222222222222",
  userId: "user-1",
  perfumeId: perfume.id,
  usedAt: "2026-08-03T12:00:00.000Z",
  occasionKey: "trabalho",
  timeKey: "manha",
  environmentKey: "fechado",
  complimentsCount: 0,
  satisfaction: 4,
  performanceRating: null,
  weatherSource: null,
  temperature: null,
  feelsLike: null,
  weatherCondition: null,
  seasonKey: null,
  city: null,
  notes: null,
  createdAt: "2026-08-03T12:01:00.000Z",
  updatedAt: "2026-08-03T12:01:00.000Z",
};

describe("UsageDiary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createUsageAction.mockResolvedValue({
      status: "success",
      message: "Uso registrado.",
    });
    mocks.updateUsageAction.mockResolvedValue({
      status: "success",
      message: "Uso atualizado.",
    });
    mocks.deleteUsageAction.mockResolvedValue({ status: "success" });
  });

  it("shows a truthful empty state that opens the registration dialog", async () => {
    const user = userEvent.setup();
    render(
      <UsageDiary
        filters={{ compliments: "all", order: "newest", period: "all" }}
        initialPage={{ items: [], nextCursor: null }}
        perfumes={[perfume]}
      />,
    );

    expect(screen.getByText("Seu diário começa no primeiro uso")).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Registrar uso" })[0]);

    const dialog = screen.getByRole("dialog", { name: "Registrar uso" });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole("combobox", { name: "Fragrância" })).toBeVisible();
    expect(within(dialog).getByRole("group", { name: "Ocasião" })).toBeVisible();
    expect(within(dialog).getByRole("group", { name: "Satisfação" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Fechar formulário" })).toHaveFocus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(within(dialog).getByRole("button", { name: "Salvar uso" })).toHaveFocus();
  });

  it("persists zero compliments and leaves optional fields empty", async () => {
    const user = userEvent.setup();
    render(
      <UsageDiary
        filters={{ compliments: "all", order: "newest", period: "all" }}
        initialPage={{ items: [], nextCursor: null }}
        perfumes={[perfume]}
      />,
    );

    await user.click(screen.getAllByRole("button", { name: "Registrar uso" })[0]);
    await user.selectOptions(screen.getByRole("combobox", { name: "Fragrância" }), perfume.id);
    await user.click(screen.getByRole("radio", { name: "Trabalho" }));
    await user.click(screen.getByRole("radio", { name: "Manhã" }));
    await user.click(screen.getByRole("radio", { name: "Fechado" }));
    await user.click(screen.getByRole("radio", { name: "Zero elogios" }));
    await user.click(screen.getByRole("radio", { name: "Satisfação 4 de 5" }));
    await user.click(screen.getByRole("button", { name: "Salvar uso" }));

    expect(mocks.createUsageAction).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(FormData),
    );
  });

  it("renders zero compliments, edits and deletes through accessible dialogs", async () => {
    const user = userEvent.setup();
    render(
      <UsageDiary
        filters={{ compliments: "all", order: "newest", period: "all" }}
        initialPage={{ items: [usage], nextCursor: null }}
        perfumes={[perfume]}
      />,
    );

    expect(screen.getByText("Nenhum elogio")).toBeInTheDocument();
    expect(screen.queryByText(/clima/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Editar uso de Essencial" }));
    expect(screen.getByRole("dialog", { name: "Editar uso" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Editar uso" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Excluir uso de Essencial" }));
    const confirmation = screen.getByRole("dialog", { name: "Excluir registro?" });
    expect(within(confirmation).getByRole("button", { name: "Cancelar" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Excluir registro?" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Excluir uso de Essencial" })).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Excluir uso de Essencial" }));
    const reopenedConfirmation = screen.getByRole("dialog", { name: "Excluir registro?" });
    await user.click(
      within(reopenedConfirmation).getByRole("button", { name: "Confirmar exclusão" }),
    );
    expect(mocks.deleteUsageAction).toHaveBeenCalledWith(usage.id);
  });

  it("exposes button filters and cursor pagination without horizontal tables", () => {
    render(
      <UsageDiary
        filters={{ compliments: "all", order: "newest", period: "7d" }}
        initialPage={{
          items: [usage],
          nextCursor: { id: usage.id, usedAt: usage.usedAt },
        }}
        perfumes={[perfume]}
      />,
    );

    expect(screen.getByRole("link", { name: "Hoje" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "7 dias" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Com elogios" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Carregar mais usos" })).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
