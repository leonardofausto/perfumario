import { describe, expect, it } from "vitest";

import { usageInputSchema } from "./schema";

const validUsage = {
  perfumeId: "11111111-1111-4111-8111-111111111111",
  usedAt: "2026-08-03T12:00:00.000Z",
  occasionKey: "trabalho",
  timeKey: "manha",
  environmentKey: "fechado",
  complimentsCount: 0,
  satisfaction: 4,
  performanceRating: null,
  weatherSource: null,
  temperature: null,
  feelsLike: null,
  weatherCondition: null,
  seasonKey: null,
  city: null,
  notes: null,
};

describe("usageInputSchema", () => {
  it("accepts a real usage with zero compliments and no weather", () => {
    expect(
      usageInputSchema.safeParse(validUsage, {
        reportInput: true,
      }).success,
    ).toBe(true);
  });

  it.each([
    ["negative compliments", { complimentsCount: -1 }],
    ["fractional compliments", { complimentsCount: 1.5 }],
    ["satisfaction below the scale", { satisfaction: 0 }],
    ["satisfaction above the scale", { satisfaction: 6 }],
    ["performance above the scale", { performanceRating: 6 }],
  ])("rejects %s", (_label, override) => {
    expect(usageInputSchema.safeParse({ ...validUsage, ...override }).success).toBe(
      false,
    );
  });

  it("rejects future usage dates", () => {
    expect(
      usageInputSchema.safeParse({
        ...validUsage,
        usedAt: "2999-01-01T00:00:00.000Z",
      }).success,
    ).toBe(false);
  });

  it("requires weather details to match the declared source", () => {
    expect(
      usageInputSchema.safeParse({
        ...validUsage,
        weatherSource: null,
        temperature: 22,
      }).success,
    ).toBe(false);

    expect(
      usageInputSchema.safeParse({
        ...validUsage,
        weatherSource: "automatic",
        temperature: 22,
        feelsLike: 21,
        weatherCondition: "céu limpo",
        seasonKey: "inverno",
        city: "São Paulo",
      }).success,
    ).toBe(true);
  });
});
