import { describe, expect, it } from "vitest";

import {
  canSetReplenishmentIntent,
  containerStatusSchema,
  getContainerAlert,
} from "./container-status";

describe("container status", () => {
  it.each(["unknown", "full", "half", "low", "empty"] as const)(
    "persists the qualitative level %s",
    (level) => {
      expect(
        containerStatusSchema.parse({
          bottleFormat: "full_bottle",
          level,
          replenishmentIntent: null,
        }).level,
      ).toBe(level);
    },
  );

  it("accepts only intents compatible with the container type", () => {
    expect(
      containerStatusSchema.safeParse({
        bottleFormat: "decant",
        level: "low",
        replenishmentIntent: "buy_bottle",
      }).success,
    ).toBe(true);
    expect(
      containerStatusSchema.safeParse({
        bottleFormat: "full_bottle",
        level: "low",
        replenishmentIntent: "buy_decant",
      }).success,
    ).toBe(false);
  });

  it("allows a new intent only for low or empty items", () => {
    expect(canSetReplenishmentIntent("half", "buy_again", null)).toBe(false);
    expect(canSetReplenishmentIntent("full", "buy_again", "buy_again")).toBe(true);
    expect(canSetReplenishmentIntent("empty", "buy_again", null)).toBe(true);
  });

  it("derives truthful alerts without numerical precision", () => {
    expect(getContainerAlert("unknown")).toBeNull();
    expect(getContainerAlert("full")).toBeNull();
    expect(getContainerAlert("half")).toBeNull();
    expect(getContainerAlert("low")).toEqual({ tone: "attention", label: "No final" });
    expect(getContainerAlert("empty")).toEqual({ tone: "action", label: "Acabou" });
  });
});
