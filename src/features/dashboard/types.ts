import type { AnalyticsSnapshot } from "@/features/analytics/types";

export type DashboardPeriod = "7d" | "30d" | "year";

export type DashboardOverviewData = {
  snapshot: AnalyticsSnapshot;
  replenishment: {
    lowCount: number;
    emptyCount: number;
    purchaseIntentCount: number;
    undecidedCount: number;
  };
  recentUsages: Array<{
    id: string;
    perfumeId: string;
    perfumeName: string;
    perfumeBrand: string;
    usedAt: string;
    complimentsCount: number;
    satisfaction: number;
  }>;
};
