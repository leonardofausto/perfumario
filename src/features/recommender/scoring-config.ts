import type { RecommenderCriterion } from "./types";

export const SCORING_WEIGHTS: Record<RecommenderCriterion, number> = {
  weather: 30,
  performance: 15,
  sensory: 15,
  season: 10,
  occasion: 20,
  time: 15,
  environment: 10,
};

export const PERFORMANCE_SELECTIONS = [
  "fixacao",
  "projecao",
  "rastro",
  "versatilidade",
  "presenca",
] as const;

export const SENSORY_SELECTION_TO_FIELD = {
  intensity: "intensity",
  sweetness: "sweetness",
  freshness: "freshness",
  elegance: "elegance",
  sensuality: "sensuality",
} as const;

export const SEASON_SELECTIONS = [
  "primavera",
  "verao",
  "outono",
  "inverno",
] as const;

export const OCCASION_SELECTIONS = [
  "ar_livre",
  "casual",
  "encontro",
  "festa",
  "formal",
  "trabalho",
] as const;

export const TIME_SELECTIONS = ["manha", "tarde", "noite", "madrugada"] as const;

export const ENVIRONMENT_SELECTIONS = ["ar_livre", "fechado"] as const;
