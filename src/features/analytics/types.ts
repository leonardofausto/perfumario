export const ANALYTICS_PERIODS = ["7d", "30d", "90d", "year", "all"] as const;

export type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number];
export type MetricStatus = "available" | "empty";

export type AnalyticsMetric<T> = {
  status: MetricStatus;
  value: T | null;
  sampleSize: number;
};

export type SeriesPoint = {
  bucket: string;
  value: number;
};

export type GroupMetric = {
  key: string;
  value: number;
  sampleSize?: number;
};

export type PerfumeMetric = {
  perfumeId: string;
  name: string;
  value: number;
  sampleSize?: number;
};

export type ForgottenPerfume = {
  perfumeId: string;
  name: string;
  lastUsedAt: string | null;
  daysSinceLastUse: number | null;
};

export type AnalyticsSnapshot = {
  meta: {
    period: AnalyticsPeriod;
    timezone: string;
    from: string | null;
    to: string;
    buckets: string[];
  };
  collection: {
    hasData: boolean;
    total: number;
    favorites: number;
    distinctBrands: number;
    byBrand: GroupMetric[];
    byCategory: GroupMetric[];
    byConcentration: GroupMetric[];
    growth: SeriesPoint[];
    low: number;
    empty: number;
  };
  usage: {
    hasData: boolean;
    total: number;
    daysUsed: number;
    uniquePerfumes: number;
    averagePerWeek: number | null;
    mostUsed: PerfumeMetric | null;
    leastUsed: PerfumeMetric | null;
    daysSinceLastUse: number | null;
    forgotten: ForgottenPerfume[];
    series: SeriesPoint[];
  };
  compliments: {
    total: AnalyticsMetric<number>;
    usesWithCompliments: AnalyticsMetric<number>;
    usageRate: AnalyticsMetric<number>;
    mostComplimented: PerfumeMetric | null;
    byOccasion: GroupMetric[];
    byTime: GroupMetric[];
    byClimate: GroupMetric[];
  };
  satisfaction: {
    average: AnalyticsMetric<number>;
    bestAverage: PerfumeMetric | null;
    distribution: GroupMetric[];
    byOccasion: GroupMetric[];
    byClimate: GroupMetric[];
  };
  performance: {
    average: AnalyticsMetric<number>;
    bestResults: PerfumeMetric[];
    complimentRelation: GroupMetric[];
  };
};

export type AnalyticsFilter = {
  period: AnalyticsPeriod;
  timezone: string;
};
