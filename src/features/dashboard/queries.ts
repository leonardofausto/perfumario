import "server-only";

import { getOwnAnalyticsSnapshot } from "@/features/analytics/queries";
import {
  getOwnReplenishmentSummary,
  listOwnPerfumes,
} from "@/features/perfumes/queries";
import { listOwnUsages } from "@/features/usage-log/repository";

import type { DashboardOverviewData, DashboardPeriod } from "./types";

export async function getOwnDashboardOverview(input: {
  period: DashboardPeriod;
  timezone: string;
}): Promise<DashboardOverviewData> {
  const [snapshot, replenishment, usagePage, perfumes] = await Promise.all([
    getOwnAnalyticsSnapshot(input),
    getOwnReplenishmentSummary(),
    listOwnUsages({ limit: 4 }),
    listOwnPerfumes(),
  ]);
  const perfumesById = new Map(
    perfumes.map((perfume) => [perfume.id, perfume] as const),
  );

  return {
    snapshot,
    replenishment,
    recentUsages: usagePage.items.flatMap((usage) => {
      const perfume = perfumesById.get(usage.perfumeId);
      return perfume
        ? [{
            id: usage.id,
            perfumeId: usage.perfumeId,
            perfumeName: perfume.name,
            perfumeBrand: perfume.brand,
            usedAt: usage.usedAt,
            complimentsCount: usage.complimentsCount,
            satisfaction: usage.satisfaction,
          }]
        : [];
    }),
  };
}
