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
};

export type RecommenderInput = {
  perfumes: RecommenderPerfume[];
  contextMode: RecommenderContextMode;
  climate: RecommenderClimateContext;
  selection: RecommenderSelection;
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
  contributions: RecommenderContribution[];
  tieBreakers: {
    weather: number;
    occasion: number;
    versatility: number;
    fixation: number;
  };
};
