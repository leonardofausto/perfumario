import type { PerfumeScore, PerfumeSummary } from "@/features/perfumes/types";

export type RecommenderContextMode = "automatic" | "manual";

export type RecommenderSeason = "primavera" | "verao" | "outono" | "inverno";

export type RecommenderClimateContext = {
  cidade: string;
  clima: string | null;
  temperaturaCelsius: number | null;
  estacao: RecommenderSeason | null;
  sensacaoCelsius?: number | null;
  chuva?: string | null;
  ventoKmh?: number | null;
};

export type RecommenderSelection = {
  performance: string[];
  sensory: string[];
  seasons: string[];
  occasions: string[];
  times: string[];
  environments: string[];
};

export type RecommenderPerfume = PerfumeSummary & {
  scores: PerfumeScore[];
  history?: RecommenderHistory;
};

export type RecommenderInput = {
  perfumes: RecommenderPerfume[];
  contextMode: RecommenderContextMode;
  climate: RecommenderClimateContext;
  selection: RecommenderSelection;
  now?: string;
};

export type RecommenderHistoryUsage = {
  perfumeId: string;
  usedAt: string;
  occasionKey: string;
  complimentsCount: number;
  satisfaction: number;
  performanceRating: number | null;
  seasonKey: string | null;
};

export type RecommenderHistorySample = {
  totalUses: number;
  complimentsTotal: number;
  complimentedUses: number;
  satisfactionTotal: number;
  satisfactionCount: number;
  performanceTotal: number;
  performanceCount: number;
};

export type RecommenderHistory = RecommenderHistorySample & {
  lastUsedAt: string | null;
  byOccasion: Record<string, RecommenderHistorySample>;
  bySeason: Record<string, RecommenderHistorySample>;
};

export type RecommenderHistorySignal = {
  key:
    | "frequency"
    | "compliments"
    | "complimentRate"
    | "satisfaction"
    | "occasion"
    | "climate"
    | "performance"
    | "recency";
  score: number;
  sampleSize: number;
  weight: number;
};

export type RecommenderHistoryEvaluation = {
  score: number | null;
  adjustment: number;
  reasons: string[];
  signals: RecommenderHistorySignal[];
};

export type RecommenderCriterion =
  | "weather"
  | "performance"
  | "sensory"
  | "season"
  | "occasion"
  | "time"
  | "environment";

export type RecommenderContribution = {
  criterion: RecommenderCriterion;
  score: number;
  weight: number;
};

export type RecommenderScoreResult = {
  perfume: RecommenderPerfume;
  score: number;
  reasons: string[];
  attention: string | null;
  availabilityNotice: string | null;
  contributions: RecommenderContribution[];
  historyAdjustment: number;
  historyReasons: string[];
  historySignals: RecommenderHistorySignal[];
  tieBreakers: {
    weather: number;
    occasion: number;
    historicalOccasion: number;
    historicalSatisfaction: number;
    historicalCompliments: number;
    historicalRecency: number;
    versatility: number;
    fixation: number;
  };
};
