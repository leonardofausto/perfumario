import { describe, expect, it } from "vitest";

import { ANALYTICS_METRIC_CATALOG } from "./catalog";
import {
  averageMetric,
  normalizeSeries,
  ratioMetric,
} from "./metrics";

describe("analytics metrics", () => {
  it("distinguishes an unavailable metric from a real zero", () => {
    expect(ratioMetric(0, 0)).toEqual({
      status: "empty",
      value: null,
      sampleSize: 0,
    });
    expect(ratioMetric(0, 4)).toEqual({
      status: "available",
      value: 0,
      sampleSize: 4,
    });
  });

  it("calculates averages only when eligible observations exist", () => {
    expect(averageMetric(0, 0)).toEqual({
      status: "empty",
      value: null,
      sampleSize: 0,
    });
    expect(averageMetric(9, 2)).toEqual({
      status: "available",
      value: 4.5,
      sampleSize: 2,
    });
  });

  it("normalizes sparse series without fabricating a series for an empty dataset", () => {
    const buckets = ["2026-07-28", "2026-07-29", "2026-07-30"];

    expect(
      normalizeSeries(buckets, [{ bucket: "2026-07-29", value: 2 }], true),
    ).toEqual([
      { bucket: "2026-07-28", value: 0 },
      { bucket: "2026-07-29", value: 2 },
      { bucket: "2026-07-30", value: 0 },
    ]);
    expect(normalizeSeries(buckets, [], false)).toEqual([]);
  });

  it("documents every priority metric with an unambiguous formula", () => {
    expect(ANALYTICS_METRIC_CATALOG.length).toBeGreaterThanOrEqual(25);
    for (const metric of ANALYTICS_METRIC_CATALOG) {
      expect(metric.key).not.toBe("");
      expect(metric.formula).not.toMatch(/TBD|TODO|a definir/i);
      expect(metric.emptyRule).not.toBe("");
    }
    expect(
      ANALYTICS_METRIC_CATALOG.find((metric) => metric.key === "compliment_usage_rate")
        ?.formula,
    ).toContain("usos com pelo menos um elogio / total de usos elegíveis");
  });
});
