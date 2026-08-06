import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AnalyticsSnapshot } from "@/features/analytics/types";

const { getOwnAnalyticsSnapshot } = vi.hoisted(() => ({
  getOwnAnalyticsSnapshot: vi.fn(),
}));

vi.mock("@/features/analytics/queries", () => ({ getOwnAnalyticsSnapshot }));

import AnalyticsPage from "./page";

const snapshot = {
  meta: {
    period: "30d",
    timezone: "America/Sao_Paulo",
    from: "2026-07-05T00:00:00-03:00",
    to: "2026-08-03T12:00:00-03:00",
    buckets: ["2026-08-02", "2026-08-03"],
  },
  collection: {
    hasData: true,
    total: 3,
    favorites: 1,
    distinctBrands: 2,
    byBrand: [],
    byCategory: [{ key: "Designer", value: 3 }],
    byConcentration: [{ key: "Eau de parfum", value: 3 }],
    growth: [{ bucket: "2026-08-02", value: 1 }],
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
    byOccasion: [{ key: "Trabalho", value: 0 }],
    byTime: [],
    byClimate: [],
  },
  satisfaction: {
    average: { status: "available", value: 4.5, sampleSize: 2 },
    bestAverage: { perfumeId: "one", name: "Odyssey", value: 4.5, sampleSize: 2 },
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

describe("AnalyticsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getOwnAnalyticsSnapshot.mockResolvedValue(snapshot);
  });

  it("loads the authenticated snapshot using validated URL filters", async () => {
    render(
      await AnalyticsPage({
        searchParams: Promise.resolve({
          period: "7d",
          timezone: "America/Sao_Paulo",
        }),
      }),
    );

    expect(getOwnAnalyticsSnapshot).toHaveBeenCalledWith({
      period: "7d",
      timezone: "America/Sao_Paulo",
    });
    expect(
      screen.getByRole("heading", { level: 1, name: "Análises" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Entenda seus hábitos e preferências.")).toBeInTheDocument();
  });

  it("falls back to safe analytics filters", async () => {
    render(
      await AnalyticsPage({
        searchParams: Promise.resolve({ period: "invalid", timezone: "../invalid" }),
      }),
    );

    expect(getOwnAnalyticsSnapshot).toHaveBeenCalledWith({
      period: "30d",
      timezone: "America/Sao_Paulo",
    });
  });
});
