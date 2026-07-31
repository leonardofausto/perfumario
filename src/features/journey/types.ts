import type { OCCASION_METRICS } from "./constants";

export type JourneyOccasion = (typeof OCCASION_METRICS)[number];

export type JourneyUsageEntry = {
  id: string;
  userId: string;
  perfumeId: string | null;
  perfumeNameSnapshot: string;
  brandNameSnapshot: string | null;
  imagePathSnapshot: string | null;
  imageUrl: string | null;
  usedAt: string;
  occasion: JourneyOccasion;
  satisfaction: number | null;
  complimentsCount: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type JourneyUsageEntryCreateInput = {
  perfumeId: string | null;
  perfumeNameSnapshot: string;
  brandNameSnapshot?: string | null;
  imagePathSnapshot?: string | null;
  usedAt: string;
  occasion: JourneyOccasion;
  satisfaction?: number | null;
  complimentsCount?: number;
  notes?: string | null;
};

export type JourneyUsageEntryUpdateInput = JourneyUsageEntryCreateInput;

export type JourneyPeriod = "7d" | "30d" | "month" | "all";
export type JourneyMoment = "manha" | "tarde" | "noite" | "madrugada";

export type JourneyUsageFilters = {
  period: JourneyPeriod;
  query: string;
  pageSize: number;
  cursor: string | null;
};

export type JourneyUsagePage = {
  entries: JourneyUsageEntry[];
  nextCursor: string | null;
  summary: {
    monthCount: number;
    mostUsed: string | null;
    lastUsed: JourneyUsageEntry | null;
  };
};

export type JourneyPerfumeSummary = {
  usageCount: number;
  lastUsedAt: string | null;
  averageSatisfaction: number | null;
  complimentsCount: number;
  frequentOccasion: JourneyOccasion | null;
  occasionCounts: Partial<Record<JourneyOccasion, number>>;
  favoriteMoment: JourneyMoment | null;
  momentCounts: Partial<Record<JourneyMoment, number>>;
};
