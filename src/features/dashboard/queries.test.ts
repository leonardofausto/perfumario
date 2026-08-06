import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getOwnAnalyticsSnapshot: vi.fn(),
  getOwnReplenishmentSummary: vi.fn(),
  listOwnPerfumes: vi.fn(),
  listOwnUsages: vi.fn(),
}));

vi.mock("@/features/analytics/queries", () => ({
  getOwnAnalyticsSnapshot: mocks.getOwnAnalyticsSnapshot,
}));
vi.mock("@/features/perfumes/queries", () => ({
  getOwnReplenishmentSummary: mocks.getOwnReplenishmentSummary,
  listOwnPerfumes: mocks.listOwnPerfumes,
}));
vi.mock("@/features/usage-log/repository", () => ({
  listOwnUsages: mocks.listOwnUsages,
}));

import { getOwnDashboardOverview } from "./queries";

describe("getOwnDashboardOverview", () => {
  beforeEach(() => vi.clearAllMocks());

  it("composes only private query results and maps recent perfume names", async () => {
    mocks.getOwnAnalyticsSnapshot.mockResolvedValue({ collection: { total: 1 } });
    mocks.getOwnReplenishmentSummary.mockResolvedValue({ lowCount: 0 });
    mocks.listOwnPerfumes.mockResolvedValue([
      { id: "perfume", name: "Odyssey", brand: "Armaf" },
    ]);
    mocks.listOwnUsages.mockResolvedValue({
      items: [
        {
          id: "usage",
          perfumeId: "perfume",
          usedAt: "2026-08-03T12:00:00.000Z",
          complimentsCount: 0,
          satisfaction: 5,
        },
      ],
      nextCursor: null,
    });

    const result = await getOwnDashboardOverview({
      period: "30d",
      timezone: "America/Sao_Paulo",
    });

    expect(mocks.getOwnAnalyticsSnapshot).toHaveBeenCalledWith({
      period: "30d",
      timezone: "America/Sao_Paulo",
    });
    expect(mocks.listOwnUsages).toHaveBeenCalledWith({ limit: 4 });
    expect(result.recentUsages).toEqual([
      {
        id: "usage",
        perfumeId: "perfume",
        perfumeName: "Odyssey",
        perfumeBrand: "Armaf",
        usedAt: "2026-08-03T12:00:00.000Z",
        complimentsCount: 0,
        satisfaction: 5,
      },
    ]);
  });
});
