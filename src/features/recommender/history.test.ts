import { describe, expect, it } from "vitest";

import {
  aggregateRecommenderHistory,
  evaluateRecommenderHistory,
} from "./history";
import type { RecommenderHistoryUsage } from "./types";

function usage(
  overrides: Partial<RecommenderHistoryUsage> = {},
): RecommenderHistoryUsage {
  return {
    perfumeId: "one",
    usedAt: "2026-08-01T12:00:00.000Z",
    occasionKey: "trabalho",
    complimentsCount: 0,
    satisfaction: 4,
    performanceRating: null,
    seasonKey: "inverno",
    ...overrides,
  };
}

describe("recommender history", () => {
  it("aggregates only the supplied private rows and preserves real zero compliments", () => {
    const histories = aggregateRecommenderHistory([
      usage(),
      usage({
        usedAt: "2026-08-02T12:00:00.000Z",
        complimentsCount: 2,
        satisfaction: 5,
        performanceRating: 4,
      }),
    ]);

    expect(histories.get("one")).toEqual(
      expect.objectContaining({
        totalUses: 2,
        complimentsTotal: 2,
        complimentedUses: 1,
        satisfactionTotal: 9,
        satisfactionCount: 2,
        performanceTotal: 4,
        performanceCount: 1,
        lastUsedAt: "2026-08-02T12:00:00.000Z",
      }),
    );
  });

  it("requires a minimum sample for rates and redistributes valid weights", () => {
    const oneUse = aggregateRecommenderHistory([usage()]).get("one")!;
    const evaluation = evaluateRecommenderHistory(oneUse, {
      occasions: ["trabalho"],
      season: "inverno",
      now: "2026-08-03T12:00:00.000Z",
    });

    expect(evaluation.signals.map((signal) => signal.key)).toEqual([
      "frequency",
      "recency",
    ]);
    expect(evaluation.score).not.toBeNull();
    expect(Math.abs(evaluation.adjustment)).toBeLessThanOrEqual(5);
  });

  it("uses context success only after three observations", () => {
    const history = aggregateRecommenderHistory([
      usage({ complimentsCount: 0, satisfaction: 4 }),
      usage({ complimentsCount: 1, satisfaction: 5 }),
      usage({ complimentsCount: 0, satisfaction: 4 }),
    ]).get("one")!;
    const evaluation = evaluateRecommenderHistory(history, {
      occasions: ["trabalho"],
      season: "inverno",
      now: "2026-08-03T12:00:00.000Z",
    });

    expect(evaluation.signals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "complimentRate", sampleSize: 3 }),
        expect.objectContaining({ key: "occasion", sampleSize: 3 }),
        expect.objectContaining({ key: "climate", sampleSize: 3 }),
      ]),
    );
    expect(evaluation.reasons).toContain("Costuma funcionar bem em trabalho.");
  });

  it("keeps zero compliment rates as valid after the minimum sample", () => {
    const history = aggregateRecommenderHistory([usage(), usage(), usage()]).get("one")!;
    const evaluation = evaluateRecommenderHistory(history, {
      occasions: [],
      season: null,
      now: "2026-08-03T12:00:00.000Z",
    });

    expect(evaluation.signals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "compliments", score: 0, sampleSize: 3 }),
        expect.objectContaining({ key: "complimentRate", score: 0, sampleSize: 3 }),
      ]),
    );
  });
});
