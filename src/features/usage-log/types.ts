import type { UsageRecordBase } from "@/features/experience/types";

export const USAGE_OCCASIONS = [
  "ar_livre",
  "casual",
  "encontro",
  "festa",
  "formal",
  "trabalho",
] as const;

export const USAGE_TIMES = ["manha", "tarde", "noite", "madrugada"] as const;
export const USAGE_ENVIRONMENTS = ["ar_livre", "fechado"] as const;
export const USAGE_SEASONS = [
  "primavera",
  "verao",
  "outono",
  "inverno",
] as const;
export const WEATHER_SOURCES = ["automatic", "manual"] as const;

export type UsageOccasion = (typeof USAGE_OCCASIONS)[number];
export type UsageTime = (typeof USAGE_TIMES)[number];
export type UsageEnvironment = (typeof USAGE_ENVIRONMENTS)[number];
export type UsageSeason = (typeof USAGE_SEASONS)[number];
export type WeatherSource = (typeof WEATHER_SOURCES)[number];

export type UsageInput = {
  perfumeId: string;
  usedAt: string;
  occasionKey: UsageOccasion;
  timeKey: UsageTime;
  environmentKey: UsageEnvironment;
  complimentsCount: number;
  satisfaction: number;
  performanceRating: number | null;
  weatherSource: WeatherSource | null;
  temperature: number | null;
  feelsLike: number | null;
  weatherCondition: string | null;
  seasonKey: UsageSeason | null;
  city: string | null;
  notes: string | null;
};

export type UsageRecord = UsageRecordBase &
  Omit<UsageInput, "perfumeId" | "usedAt"> & {
    createdAt: string;
    updatedAt: string;
  };

export type UsageCursor = {
  usedAt: string;
  id: string;
};

export type UsagePage = {
  items: UsageRecord[];
  nextCursor: UsageCursor | null;
};

export type UsagePeriod = {
  from: string;
  to: string;
};
