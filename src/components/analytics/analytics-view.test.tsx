import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { AnalyticsSnapshot } from "@/features/analytics/types";

import { AnalyticsView } from "./analytics-view";
import AnalyticsError from "@/app/(app)/analises/error";
import AnalyticsLoading from "@/app/(app)/analises/loading";

const snapshot = {
  meta: {
    period: "30d",
    timezone: "America/Sao_Paulo",
    from: "2026-07-05",
    to: "2026-08-03",
    buckets: ["2026-08-02", "2026-08-03"],
  },
  collection: {
    hasData: true,
    total: 2,
    favorites: 1,
    distinctBrands: 2,
    byBrand: [],
    byCategory: [{ key: "Designer", value: 2 }],
    byConcentration: [{ key: "Eau de parfum", value: 2 }],
    growth: [],
    low: 1,
    empty: 0,
  },
  usage: {
    hasData: true,
    total: 2,
    daysUsed: 2,
    uniquePerfumes: 1,
    averagePerWeek: 0.5,
    mostUsed: { perfumeId: "one", name: "Odyssey", value: 2 },
    leastUsed: { perfumeId: "one", name: "Odyssey", value: 2 },
    daysSinceLastUse: 0,
    forgotten: [],
    series: [
      { bucket: "2026-08-02", value: 0 },
      { bucket: "2026-08-03", value: 2 },
    ],
  },
  compliments: {
    total: { status: "available", value: 0, sampleSize: 2 },
    usesWithCompliments: { status: "available", value: 0, sampleSize: 2 },
    usageRate: { status: "available", value: 0, sampleSize: 2 },
    mostComplimented: null,
    byOccasion: [],
    byTime: [],
    byClimate: [],
  },
  satisfaction: {
    average: { status: "available", value: 4.5, sampleSize: 2 },
    bestAverage: { perfumeId: "one", name: "Odyssey", value: 4.5 },
    distribution: [{ key: "5", value: 1 }],
    byOccasion: [],
    byClimate: [],
  },
  performance: {
    average: { status: "empty", value: null, sampleSize: 0 },
    bestResults: [],
    complimentRelation: [],
  },
} satisfies AnalyticsSnapshot;

describe("AnalyticsView", () => {
  it("distinguishes real zero compliments from unavailable data", () => {
    render(<AnalyticsView snapshot={snapshot} />);

    expect(screen.getByText("0", { selector: "[data-metric='compliments']" })).toBeInTheDocument();
    expect(screen.getByText("4,5", { selector: "[data-metric='satisfaction']" })).toBeInTheDocument();
  });

  it("switches dimension with keyboard-accessible buttons", async () => {
    const user = userEvent.setup();
    render(<AnalyticsView snapshot={snapshot} />);

    await user.click(screen.getByRole("button", { name: "Satisfação" }));

    expect(screen.getByRole("button", { name: "Satisfação" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("heading", { name: "Distribuição das notas" })).toBeInTheDocument();
  });

  it("provides accessible point details and period links", () => {
    render(<AnalyticsView snapshot={snapshot} />);

    expect(screen.getByRole("img", { name: "Evolução de usos" })).toBeInTheDocument();
    expect(screen.getByLabelText("2026-08-03: 2 usos")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "7 dias" })).toHaveAttribute(
      "href",
      expect.stringContaining("period=7d"),
    );
  });

  it("renders a truthful empty state without charts", () => {
    render(
      <AnalyticsView
        snapshot={{
          ...snapshot,
          usage: { ...snapshot.usage, hasData: false, total: 0, series: [] },
          compliments: {
            ...snapshot.compliments,
            total: { status: "empty", value: null, sampleSize: 0 },
          },
          satisfaction: {
            ...snapshot.satisfaction,
            average: { status: "empty", value: null, sampleSize: 0 },
          },
        }}
      />,
    );

    expect(screen.getByText("Seu diário ainda não tem usos")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Evolução de usos" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Registrar primeiro uso" })).toHaveAttribute(
      "href",
      "/diario",
    );
  });

  it("announces loading and lets the user retry after an error", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    const { rerender } = render(<AnalyticsLoading />);

    expect(screen.getByRole("status", { name: "Carregando análises" })).toBeInTheDocument();

    rerender(<AnalyticsError reset={reset} />);
    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(reset).toHaveBeenCalledOnce();
  });
});
