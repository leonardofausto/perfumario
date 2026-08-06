import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerSupabase: vi.fn(),
  requireUser: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/session", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: mocks.createServerSupabase,
}));

import { getOwnAnalyticsSnapshot } from "./queries";
import type { AnalyticsFilter } from "./types";

const rawSnapshot = {
  meta: {
    period: "7d",
    timezone: "America/Sao_Paulo",
    from: "2026-07-28T03:00:00.000Z",
    to: "2026-08-04T03:00:00.000Z",
    buckets: ["2026-07-28", "2026-07-29", "2026-07-30"],
  },
  collection: {
    hasData: true,
    total: 2,
    favorites: 1,
    distinctBrands: 2,
    byBrand: [{ key: "Natura", value: 1 }],
    byCategory: [],
    byConcentration: [{ key: "eau_de_parfum", value: 2 }],
    growth: [{ bucket: "2026-07-29", value: 1 }],
    low: 1,
    empty: 0,
  },
  usage: {
    hasData: true,
    total: 2,
    daysUsed: 1,
    uniquePerfumes: 1,
    averagePerWeek: 2,
    mostUsed: { perfumeId: "11111111-1111-4111-8111-111111111111", name: "Essencial", value: 2 },
    leastUsed: { perfumeId: "11111111-1111-4111-8111-111111111111", name: "Essencial", value: 2 },
    daysSinceLastUse: 1,
    forgotten: [],
    series: [{ bucket: "2026-07-29", value: 2 }],
  },
  compliments: {
    total: { status: "available", value: 0, sampleSize: 2 },
    usesWithCompliments: { status: "available", value: 0, sampleSize: 2 },
    usageRate: { status: "available", value: 0, sampleSize: 2 },
    mostComplimented: null,
    byOccasion: [{ key: "trabalho", value: 0, sampleSize: 2 }],
    byTime: [{ key: "manha", value: 0, sampleSize: 2 }],
    byClimate: [],
  },
  satisfaction: {
    average: { status: "available", value: 4, sampleSize: 2 },
    bestAverage: null,
    distribution: [{ key: "4", value: 2 }],
    byOccasion: [{ key: "trabalho", value: 4, sampleSize: 2 }],
    byClimate: [],
  },
  performance: {
    average: { status: "empty", value: null, sampleSize: 0 },
    bestResults: [],
    complimentRelation: [],
  },
};

describe("analytics queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUser.mockResolvedValue({ id: "user-1" });
  });

  it("calls the private analytics RPC and normalizes sparse series", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: rawSnapshot, error: null });
    mocks.createServerSupabase.mockResolvedValue({ rpc });

    const result = await getOwnAnalyticsSnapshot({
      period: "7d",
      timezone: "America/Sao_Paulo",
    });

    expect(rpc).toHaveBeenCalledWith("get_analytics_snapshot", {
      p_user_id: "user-1",
      p_period: "7d",
      p_timezone: "America/Sao_Paulo",
    });
    expect(result.usage.series).toEqual([
      { bucket: "2026-07-28", value: 0 },
      { bucket: "2026-07-29", value: 2 },
      { bucket: "2026-07-30", value: 0 },
    ]);
    expect(result.compliments.total.value).toBe(0);
  });

  it("keeps series empty when the owner has no matching usage data", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        ...rawSnapshot,
        usage: { ...rawSnapshot.usage, hasData: false, total: 0, series: [] },
      },
      error: null,
    });
    mocks.createServerSupabase.mockResolvedValue({ rpc });

    const result = await getOwnAnalyticsSnapshot({
      period: "30d",
      timezone: "America/Sao_Paulo",
    });

    expect(result.usage.series).toEqual([]);
  });

  it("rejects invalid filters before opening a database client", async () => {
    await expect(
      getOwnAnalyticsSnapshot({
        period: "365d",
        timezone: "UTC",
      } as unknown as AnalyticsFilter),
    ).rejects.toThrow();
    expect(mocks.createServerSupabase).not.toHaveBeenCalled();
  });
});
