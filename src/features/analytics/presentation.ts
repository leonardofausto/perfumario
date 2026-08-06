import type { GroupMetric, SeriesPoint } from "./types";

export type ChartPoint = SeriesPoint & { x: number; y: number };

export function lineChartPoints(
  series: readonly SeriesPoint[],
  width: number,
  height: number,
): ChartPoint[] {
  if (series.length === 0) return [];

  const max = Math.max(...series.map((point) => point.value), 1);
  const lastIndex = Math.max(series.length - 1, 1);

  return series.map((point, index) => ({
    ...point,
    x: (index / lastIndex) * width,
    y: height - (point.value / max) * height,
  }));
}

export function maxGroupValue(groups: readonly GroupMetric[]) {
  return groups.reduce((max, group) => Math.max(max, group.value), 0);
}
