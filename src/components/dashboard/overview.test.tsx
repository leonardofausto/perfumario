import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { DashboardOverviewData } from "@/features/dashboard/types";

import { DashboardOverview } from "./overview";

import { overviewFixture } from "./overview.test-fixture";

describe("DashboardOverview", () => {
  it("orients an empty collection without rendering invented charts", () => {
    render(
      <DashboardOverview
        data={{
          ...overviewFixture,
          snapshot: {
            ...overviewFixture.snapshot,
            collection: {
              ...overviewFixture.snapshot.collection,
              hasData: false,
              total: 0,
            },
          },
        }}
      />,
    );

    expect(screen.getByText("Sua estante começa na Minha estante")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Adicionar fragrância" })).toHaveAttribute(
      "href",
      "/colecao",
    );
    expect(screen.queryByRole("img", { name: "Movimento recente" })).not.toBeInTheDocument();
  });

  it("shows collection data but omits usage metrics when the diary is empty", () => {
    const noUsage: DashboardOverviewData = {
      ...overviewFixture,
      snapshot: {
        ...overviewFixture.snapshot,
        usage: { ...overviewFixture.snapshot.usage, hasData: false, total: 0, series: [] },
      },
      recentUsages: [],
    };
    render(<DashboardOverview data={noUsage} />);

    expect(screen.getByText("3", { selector: "[data-metric='collection']" })).toBeInTheDocument();
    expect(screen.queryByText("Movimento recente")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Registrar primeiro uso" })).toHaveAttribute(
      "href",
      "/diario",
    );
  });

  it("renders real usage, zero compliments, highlights and qualitative alerts", () => {
    render(<DashboardOverview data={overviewFixture} />);

    expect(screen.getByRole("img", { name: "Movimento recente" })).toBeInTheDocument();
    expect(screen.getByText("Nenhuma recebeu elogios")).toBeInTheDocument();
    expect(screen.getByText("0 elogios")).toBeInTheDocument();
    expect(screen.getByText("No final")).toBeInTheDocument();
    expect(screen.getByText("Acabou")).toBeInTheDocument();
    expect(screen.getAllByText("Odyssey", { selector: "strong" })).not.toHaveLength(0);
  });

  it("offers only simple period and module links", () => {
    render(<DashboardOverview data={overviewFixture} />);

    expect(screen.getByRole("link", { name: "7 dias" })).toHaveAttribute(
      "href",
      expect.stringContaining("period=7d"),
    );
    expect(screen.getByRole("link", { name: "Ver análises" })).toHaveAttribute(
      "href",
      "/analises",
    );
    expect(screen.getByRole("link", { name: "Abrir Diário" })).toHaveAttribute(
      "href",
      "/diario",
    );
  });

  it("does not manufacture attention alerts when no level was informed", () => {
    render(
      <DashboardOverview
        data={{
          ...overviewFixture,
          replenishment: {
            lowCount: 0,
            emptyCount: 0,
            purchaseIntentCount: 0,
            undecidedCount: 0,
          },
        }}
      />,
    );

    expect(screen.queryByRole("heading", { name: "Níveis e decisões" })).not.toBeInTheDocument();
  });
});
