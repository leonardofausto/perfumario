import { describe, expect, expectTypeOf, it } from "vitest";

import {
  CONTAINER_LEVELS,
  REPLENISHMENT_INTENTS_BY_CONTAINER,
  isReplenishmentIntentAllowed,
  type AnalyticsAggregate,
  type ContainerLevel,
  type ContainerType,
  type ReplenishmentIntentFor,
  type UsageRecordBase,
} from "./types";

describe("shared experience contracts", () => {
  it("keeps container levels qualitative and stable", () => {
    expect(CONTAINER_LEVELS).toEqual(["unknown", "full", "half", "low", "empty"]);
    expectTypeOf<ContainerLevel>().toEqualTypeOf<
      "unknown" | "full" | "half" | "low" | "empty"
    >();
  });

  it("limits replenishment intentions by container type", () => {
    expect(REPLENISHMENT_INTENTS_BY_CONTAINER).toEqual({
      decant: ["buy_decant", "buy_bottle", "review_later", "do_not_restock"],
      full_bottle: ["buy_again", "review_later", "do_not_restock"],
    });

    expect(isReplenishmentIntentAllowed("decant", "buy_bottle")).toBe(true);
    expect(isReplenishmentIntentAllowed("full_bottle", "buy_bottle")).toBe(false);
    expectTypeOf<ContainerType>().toEqualTypeOf<"decant" | "full_bottle">();
    expectTypeOf<ReplenishmentIntentFor<"full_bottle">>().toEqualTypeOf<
      "buy_again" | "review_later" | "do_not_restock"
    >();
  });

  it("exposes only base shapes for future usage and analytics modules", () => {
    expectTypeOf<UsageRecordBase>().toEqualTypeOf<{
      id: string;
      userId: string;
      perfumeId: string;
      usedAt: string;
    }>();
    expectTypeOf<AnalyticsAggregate<"uses">>().toEqualTypeOf<{
      metric: "uses";
      value: number;
      hasEnoughData: boolean;
    }>();
  });
});
