import { describe, expect, it } from "vitest";

import { perfumeFormSchema, perfumeImageSchema } from "./schema";

const validPerfume = {
  brand: "  Natura  ",
  name: "  Essencial  ",
  description: "  Amadeirado marcante para a noite.  ",
  concentration: "eau_de_parfum",
  bottleFormat: "full_bottle",
  inspirationKind: "original",
  inspiredBy: null,
  olfactoryFamilies: ["  Amadeirado  ", "Especiado"],
  notes: {
    top: ["Bergamota", "Pimenta rosa"],
    heart: ["Cedro"],
    base: ["Âmbar", "Patchouli"],
  },
  scores: [
    { category: "performance", metricKey: "fixacao", score: 85 },
    { category: "season", metricKey: "verao", score: null },
  ],
  launchYear: 2024,
  categoryType: "designer",
  audience: "unissex",
  intensity: 90,
  sweetness: 35,
  freshness: 0,
  elegance: null,
  sensuality: 70,
  profileTags: ["  assinatura  ", "noite"],
} as const;

describe("perfume form validation", () => {
  it("normalizes a valid original perfume while preserving note order", () => {
    const result = perfumeFormSchema.parse(validPerfume);

    expect(result.brand).toBe("Natura");
    expect(result.name).toBe("Essencial");
    expect(result.description).toBe("Amadeirado marcante para a noite.");
    expect(result.olfactoryFamilies).toEqual(["Amadeirado", "Especiado"]);
    expect(result.notes.top).toEqual(["Bergamota", "Pimenta rosa"]);
    expect(result.freshness).toBe(0);
    expect(result.elegance).toBeNull();
    expect(result.profileTags).toEqual(["assinatura", "noite"]);
  });

  it("keeps the remodel contract optional for legacy records", () => {
    const result = perfumeFormSchema.parse({
      ...validPerfume,
      launchYear: null,
      categoryType: null,
      audience: null,
      intensity: null,
      sweetness: null,
      freshness: null,
      elegance: null,
      sensuality: null,
      profileTags: [],
    });

    expect(result.launchYear).toBeNull();
    expect(result.profileTags).toEqual([]);
  });

  it("normalizes an unknown referenced perfume for dupes and inspirations", () => {
    const result = perfumeFormSchema.parse({
      ...validPerfume,
      inspirationKind: "dupe",
      inspiredBy: "   ",
    });

    expect(result.inspiredBy).toBe("Não informado");
  });

  it("rejects a reference when the perfume is original", () => {
    expect(
      perfumeFormSchema.safeParse({
        ...validPerfume,
        inspiredBy: "Bleu de Chanel",
      }).success,
    ).toBe(false);
  });

  it("rejects unsupported concentration and bottle format values", () => {
    expect(
      perfumeFormSchema.safeParse({
        ...validPerfume,
        concentration: "extract_plus",
      }).success,
    ).toBe(false);
    expect(
      perfumeFormSchema.safeParse({
        ...validPerfume,
        bottleFormat: "sample",
      }).success,
    ).toBe(false);
  });

  it("accepts the unknown concentration used by the form default", () => {
    expect(
      perfumeFormSchema.safeParse({
        ...validPerfume,
        concentration: "unknown",
      }).success,
    ).toBe(true);
  });

  it("normalizes unknown editorial fields instead of blocking save", () => {
    const result = perfumeFormSchema.parse({
      ...validPerfume,
      brand: " ",
      name: "",
      description: " ",
      olfactoryFamilies: [],
      notes: { top: [], heart: [], base: [] },
    });

    expect(result.brand).toBe("Não informado");
    expect(result.name).toBe("Não informado");
    expect(result.description).toBe("Não informado");
    expect(result.olfactoryFamilies).toEqual(["Não informado"]);
    expect(result.notes).toEqual({
      top: ["Não informado"],
      heart: ["Não informado"],
      base: ["Não informado"],
    });
  });

  it("accepts nullable integer scores from zero through one hundred", () => {
    expect(
      perfumeFormSchema.safeParse({
        ...validPerfume,
        scores: [
          { category: "accord", metricKey: "citrico", score: 95 },
          { category: "performance", metricKey: "projecao", score: 0 },
          { category: "time", metricKey: "noite", score: 100 },
          { category: "occasion", metricKey: "formal", score: null },
          { category: "environment", metricKey: "fechado", score: 80 },
        ],
      }).success,
    ).toBe(true);

    for (const score of [-1, 50.5, 101]) {
      expect(
        perfumeFormSchema.safeParse({
          ...validPerfume,
          scores: [{ category: "performance", metricKey: "fixacao", score }],
        }).success,
      ).toBe(false);
    }
  });

  it("accepts nullable remodel percentages from zero through one hundred", () => {
    for (const field of [
      "intensity",
      "sweetness",
      "freshness",
      "elegance",
      "sensuality",
    ] as const) {
      expect(
        perfumeFormSchema.safeParse({
          ...validPerfume,
          [field]: 0,
        }).success,
      ).toBe(true);
      expect(
        perfumeFormSchema.safeParse({
          ...validPerfume,
          [field]: 100,
        }).success,
      ).toBe(true);
      expect(
        perfumeFormSchema.safeParse({
          ...validPerfume,
          [field]: null,
        }).success,
      ).toBe(true);
      expect(
        perfumeFormSchema.safeParse({
          ...validPerfume,
          [field]: 101,
        }).success,
      ).toBe(false);
    }
  });

  it("rejects metric keys that do not belong to their category", () => {
    expect(
      perfumeFormSchema.safeParse({
        ...validPerfume,
        scores: [{ category: "season", metricKey: "fixacao", score: 80 }],
      }).success,
    ).toBe(false);
  });
});

describe("perfume image validation", () => {
  it("accepts JPG, PNG, AVIF, and WebP images up to 5 MB", () => {
    for (const [name, type] of [
      ["cover.jpg", "image/jpeg"],
      ["cover.png", "image/png"],
      ["cover.avif", "image/avif"],
      ["cover.webp", "image/webp"],
    ]) {
      const file = new File(["cover"], name, { type });
      expect(perfumeImageSchema.safeParse(file).success).toBe(true);
    }
  });

  it("rejects images over 5 MB and unsupported formats", () => {
    const tooLarge = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "cover.webp", {
      type: "image/webp",
    });
    const gif = new File(["cover"], "cover.gif", { type: "image/gif" });

    expect(perfumeImageSchema.safeParse(tooLarge).success).toBe(false);
    expect(perfumeImageSchema.safeParse(gif).success).toBe(false);
  });
});
