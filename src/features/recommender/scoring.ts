import {
  ENVIRONMENT_SELECTIONS,
  OCCASION_SELECTIONS,
  PERFORMANCE_SELECTIONS,
  SCORING_WEIGHTS,
  SEASON_SELECTIONS,
  SENSORY_SELECTION_TO_FIELD,
  TIME_SELECTIONS,
} from "./scoring-config";
import { explainRecommenderResult } from "./reasons";
import { evaluateRecommenderHistory } from "./history";
import { scoreWeatherFit } from "./weather-fit";
import type {
  RecommenderCriterion,
  RecommenderInput,
  RecommenderPerfume,
  RecommenderScoreResult,
} from "./types";

function isValidPercent(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function keepKnownSelections<T extends string>(
  values: string[],
  allowed: readonly T[],
): T[] {
  return values.filter((value): value is T => allowed.includes(value as T));
}

function average(values: number[]) {
  return values.length > 0
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : null;
}

function scoreMetric(
  perfume: RecommenderPerfume,
  category: string,
  metricKeys: string[],
) {
  const values = metricKeys.flatMap((metricKey) => {
    const score = perfume.scores.find(
      (item) => item.category === category && item.metricKey === metricKey,
    )?.score;

    return isValidPercent(score) ? [score] : [];
  });

  return average(values);
}

function scoreSensory(perfume: RecommenderPerfume, selections: string[]) {
  const sensoryKeys = Object.keys(SENSORY_SELECTION_TO_FIELD) as Array<
    keyof typeof SENSORY_SELECTION_TO_FIELD
  >;
  const values = keepKnownSelections(selections, sensoryKeys).flatMap(
    (selection) => {
      const field = SENSORY_SELECTION_TO_FIELD[selection];
      const score = perfume[field];

      return isValidPercent(score) ? [score] : [];
    },
  );

  return average(values);
}

function scoreCriterion(
  criterion: RecommenderCriterion,
  perfume: RecommenderPerfume,
  input: RecommenderInput,
) {
  switch (criterion) {
    case "weather":
      return scoreWeatherFit(perfume, input.climate);
    case "performance":
      return scoreMetric(
        perfume,
        "performance",
        keepKnownSelections(input.selection.performance, PERFORMANCE_SELECTIONS),
      );
    case "sensory":
      return scoreSensory(perfume, input.selection.sensory);
    case "season":
      return scoreMetric(
        perfume,
        "season",
        keepKnownSelections(input.selection.seasons, SEASON_SELECTIONS),
      );
    case "occasion":
      return scoreMetric(
        perfume,
        "occasion",
        keepKnownSelections(input.selection.occasions, OCCASION_SELECTIONS),
      );
    case "time":
      return scoreMetric(
        perfume,
        "time",
        keepKnownSelections(input.selection.times, TIME_SELECTIONS),
      );
    case "environment":
      return scoreMetric(
        perfume,
        "environment",
        keepKnownSelections(input.selection.environments, ENVIRONMENT_SELECTIONS),
      );
  }
}

function scorePerfume(perfume: RecommenderPerfume, input: RecommenderInput) {
  const contributions = (Object.keys(SCORING_WEIGHTS) as RecommenderCriterion[])
    .flatMap((criterion) => {
      const score = scoreCriterion(criterion, perfume, input);

      return score === null
        ? []
        : [{ criterion, score, weight: SCORING_WEIGHTS[criterion] }];
    });

  const totalWeight = contributions.reduce((sum, item) => sum + item.weight, 0);
  const normalizedScore =
    totalWeight > 0
      ? contributions.reduce((sum, item) => sum + item.score * item.weight, 0) /
        totalWeight
      : 0;
  const history = evaluateRecommenderHistory(perfume.history, {
    occasions: input.selection.occasions,
    season: input.climate.estacao,
    now: input.now,
  });

  const explanation = explainRecommenderResult({
    perfume,
    contextMode: input.contextMode,
    climate: input.climate,
    contributions,
  });

  return {
    perfume,
    score: Math.round(Math.max(0, Math.min(100, normalizedScore + history.adjustment))),
    reasons: [...history.reasons, ...explanation.reasons]
      .filter((reason, index, all) => all.indexOf(reason) === index)
      .slice(0, 3),
    attention: explanation.attention,
    availabilityNotice:
      perfume.containerLevel === "low"
        ? "Nível informado: No final."
        : perfume.containerLevel === "empty"
          ? "Nível informado: Acabou."
          : null,
    contributions,
    historyAdjustment: history.adjustment,
    historyReasons: history.reasons,
    historySignals: history.signals,
    tieBreakers: {
      weather: contributions.find((item) => item.criterion === "weather")?.score ?? 0,
      occasion: contributions.find((item) => item.criterion === "occasion")?.score ?? 0,
      historicalOccasion:
        history.signals.find((item) => item.key === "occasion")?.score ?? 0,
      historicalSatisfaction:
        history.signals.find((item) => item.key === "satisfaction")?.score ?? 0,
      historicalCompliments:
        history.signals.find((item) => item.key === "complimentRate")?.score ?? 0,
      historicalRecency:
        history.signals.find((item) => item.key === "recency")?.score ?? 0,
      versatility: scoreMetric(perfume, "performance", ["versatilidade"]) ?? 0,
      fixation: scoreMetric(perfume, "performance", ["fixacao"]) ?? 0,
    },
  } satisfies RecommenderScoreResult;
}

function compareResults(left: RecommenderScoreResult, right: RecommenderScoreResult) {
  return (
    right.score - left.score ||
    right.tieBreakers.weather - left.tieBreakers.weather ||
    right.tieBreakers.occasion - left.tieBreakers.occasion ||
    right.tieBreakers.historicalOccasion - left.tieBreakers.historicalOccasion ||
    right.tieBreakers.historicalSatisfaction - left.tieBreakers.historicalSatisfaction ||
    right.tieBreakers.historicalCompliments - left.tieBreakers.historicalCompliments ||
    right.tieBreakers.historicalRecency - left.tieBreakers.historicalRecency ||
    right.tieBreakers.versatility - left.tieBreakers.versatility ||
    right.tieBreakers.fixation - left.tieBreakers.fixation ||
    left.perfume.name.localeCompare(right.perfume.name, "pt-BR", {
      sensitivity: "base",
    }) ||
    left.perfume.brand.localeCompare(right.perfume.brand, "pt-BR", {
      sensitivity: "base",
    })
  );
}

export function scorePerfumes(input: RecommenderInput): RecommenderScoreResult[] {
  return input.perfumes.map((perfume) => scorePerfume(perfume, input)).sort(compareResults);
}
