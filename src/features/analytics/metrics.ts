import type { AnalyticsMetric, SeriesPoint } from "./types";

export function ratioMetric(
  numerator: number,
  denominator: number,
): AnalyticsMetric<number> {
  if (denominator === 0) {
    return { status: "empty", value: null, sampleSize: 0 };
  }

  return {
    status: "available",
    value: numerator / denominator,
    sampleSize: denominator,
  };
}

export function averageMetric(
  total: number,
  observations: number,
): AnalyticsMetric<number> {
  return ratioMetric(total, observations);
}

export function normalizeSeries(
  buckets: readonly string[],
  points: readonly SeriesPoint[],
  hasData: boolean,
): SeriesPoint[] {
  if (!hasData) return [];

  const values = new Map(points.map((point) => [point.bucket, point.value]));
  return buckets.map((bucket) => ({ bucket, value: values.get(bucket) ?? 0 }));
}
