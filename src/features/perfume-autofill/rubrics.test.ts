import { describe, expect, it } from "vitest";

import {
  ENVIRONMENT_METRICS,
  OCCASION_METRICS,
  PERFORMANCE_METRICS,
  PERFUME_PERCENT_FIELDS,
  SEASON_METRICS,
  TIME_METRICS,
} from "@/features/perfumes/constants";

import {
  AUTOFILL_RUBRIC_BANDS,
  AUTOFILL_RUBRICS,
  normalizeRubricScores,
} from "./rubrics";

describe("perfume autofill rubrics", () => {
  it("covers performance, sensory profile, and usage using existing keys", () => {
    expect(AUTOFILL_RUBRICS.performance).toEqual(PERFORMANCE_METRICS);
    expect(AUTOFILL_RUBRICS.sensory).toEqual(PERFUME_PERCENT_FIELDS);
    expect(AUTOFILL_RUBRICS.usage).toEqual([
      ...SEASON_METRICS,
      ...OCCASION_METRICS,
      ...TIME_METRICS,
      ...ENVIRONMENT_METRICS,
    ]);
  });

  it("defines coherent ascending anchors from zero through one hundred", () => {
    expect(AUTOFILL_RUBRIC_BANDS.map(({ score }) => score)).toEqual([
      0, 25, 50, 75, 100,
    ]);
    expect(new Set(AUTOFILL_RUBRIC_BANDS.map(({ label }) => label)).size).toBe(
      AUTOFILL_RUBRIC_BANDS.length,
    );
  });

  it("clamps rubric values to integers and preserves structural absence", () => {
    expect(
      normalizeRubricScores({
        fixacao: 101,
        projecao: 74.6,
        intensity: -4,
        verao: null,
        casual: Number.NaN,
        noite: 55,
      }),
    ).toEqual({
      fixacao: 100,
      projecao: 75,
      intensity: 0,
      verao: null,
      casual: null,
      noite: 55,
    });
  });
});
