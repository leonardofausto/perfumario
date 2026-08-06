import { describe, expect, it } from "vitest";

import { lineChartPoints, maxGroupValue } from "./presentation";

describe("analytics presentation transformations", () => {
  it("maps a real series into bounded SVG coordinates", () => {
    expect(
      lineChartPoints(
        [
          { bucket: "a", value: 0 },
          { bucket: "b", value: 2 },
          { bucket: "c", value: 1 },
        ],
        100,
        50,
      ),
    ).toEqual([
      { bucket: "a", value: 0, x: 0, y: 50 },
      { bucket: "b", value: 2, x: 50, y: 0 },
      { bucket: "c", value: 1, x: 100, y: 25 },
    ]);
  });

  it("does not manufacture points for an empty series", () => {
    expect(lineChartPoints([], 100, 50)).toEqual([]);
    expect(maxGroupValue([])).toBe(0);
  });
});
