import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DashboardOverviewData } from "@/features/dashboard/types";

const { getOwnDashboardOverview } = vi.hoisted(() => ({
  getOwnDashboardOverview: vi.fn(),
}));

vi.mock("@/features/dashboard/queries", () => ({ getOwnDashboardOverview }));

import DashboardPage from "./page";

const overview = {
  snapshot: {
    meta: {
      period: "30d",
      timezone: "America/Sao_Paulo",
      from: "2026-07-05",
      to: "2026-08-03",
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
      growth: [],
      low: 1,
      empty: 1,
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
      forgotten: [
        { perfumeId: "two", name: "Brisa", lastUsedAt: null, daysSinceLastUse: null },
      ],
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
      distribution: [],
      byOccasion: [],
      byClimate: [],
    },
    performance: {
      average: { status: "empty", value: null, sampleSize: 0 },
      bestResults: [],
      complimentRelation: [],
    },
  },
  replenishment: {
    lowCount: 1,
    emptyCount: 1,
    purchaseIntentCount: 1,
    undecidedCount: 1,
  },
  recentUsages: [
    {
      id: "usage",
      perfumeId: "one",
      perfumeName: "Odyssey",
      perfumeBrand: "Armaf",
      usedAt: "2026-08-03T12:00:00.000Z",
      complimentsCount: 0,
      satisfaction: 5,
    },
  ],
} satisfies DashboardOverviewData;

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getOwnDashboardOverview.mockResolvedValue(overview);
  });

  it("loads a private overview for the selected simple period", async () => {
    render(
      await DashboardPage({
        searchParams: Promise.resolve({ period: "7d" }),
      }),
    );

    expect(getOwnDashboardOverview).toHaveBeenCalledWith({
      period: "7d",
      timezone: "America/Sao_Paulo",
    });
    expect(screen.getByRole("heading", { level: 1, name: "Visão geral" })).toBeInTheDocument();
    expect(screen.getByText("Como está sua coleção hoje?")).toBeInTheDocument();
  });

  it("falls back to the 30-day period", async () => {
    render(
      await DashboardPage({
        searchParams: Promise.resolve({ period: "all" }),
      }),
    );

    expect(getOwnDashboardOverview).toHaveBeenCalledWith({
      period: "30d",
      timezone: "America/Sao_Paulo",
    });
  });
});
