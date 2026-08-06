import { describe, expect, it } from "vitest";

import { analyticsFilterSchema } from "./schema";

describe("analytics filters", () => {
  it.each(["7d", "30d", "90d", "year", "all"] as const)(
    "accepts the supported period %s",
    (period) => {
      expect(
        analyticsFilterSchema.parse({ period, timezone: "America/Sao_Paulo" }),
      ).toEqual({ period, timezone: "America/Sao_Paulo" });
    },
  );

  it("rejects unknown periods and malformed timezones", () => {
    expect(
      analyticsFilterSchema.safeParse({ period: "365d", timezone: "UTC" }).success,
    ).toBe(false);
    expect(
      analyticsFilterSchema.safeParse({ period: "30d", timezone: "../secret" }).success,
    ).toBe(false);
  });
});
