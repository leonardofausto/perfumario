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
} as const;

describe("perfume form validation", () => {
  it("normalizes a valid original perfume while preserving note order", () => {
    const result = perfumeFormSchema.parse(validPerfume);

    expect(result.brand).toBe("Natura");
    expect(result.name).toBe("Essencial");
    expect(result.description).toBe("Amadeirado marcante para a noite.");
    expect(result.olfactoryFamilies).toEqual(["Amadeirado", "Especiado"]);
    expect(result.notes.top).toEqual(["Bergamota", "Pimenta rosa"]);
  });

  it("requires the referenced perfume for dupes and inspirations", () => {
    const result = perfumeFormSchema.safeParse({
      ...validPerfume,
      inspirationKind: "dupe",
      inspiredBy: "   ",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.inspiredBy).toBeDefined();
    }
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

  it("requires identity, description, family, and one note in every pyramid layer", () => {
    const result = perfumeFormSchema.safeParse({
      ...validPerfume,
      brand: " ",
      name: "",
      description: " ",
      olfactoryFamilies: [],
      notes: { top: [], heart: [], base: [] },
    });

    expect(result.success).toBe(false);
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
  it("accepts JPEG, PNG, and WebP images up to 5 MB", () => {
    for (const [name, type] of [
      ["cover.jpg", "image/jpeg"],
      ["cover.png", "image/png"],
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
