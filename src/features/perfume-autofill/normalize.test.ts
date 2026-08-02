import { describe, expect, it } from "vitest";

import {
  clampPercent,
  normalizeAccords,
  normalizeAudience,
  normalizeCategoryType,
  normalizeConcentration,
  normalizeName,
  normalizePyramid,
  normalizeRelationship,
  normalizeYear,
} from "./normalize";

describe("perfume autofill normalization", () => {
  it("normalizes names, concentration, audience, category, and year", () => {
    expect(normalizeName("  FAKHAR   BLACK ")).toBe("Fakhar Black");
    expect(normalizeName("Y Eau de Parfum")).toBe("Y Eau de Parfum");
    expect(normalizeConcentration("EDP")).toBe("eau_de_parfum");
    expect(normalizeConcentration("óleo de perfume")).toBe("perfume_oil");
    expect(normalizeConcentration("concentração desconhecida")).toBe("unknown");
    expect(normalizeAudience("Masculino")).toBe("masculine");
    expect(normalizeAudience("compartilhável")).toBe("unisex");
    expect(normalizeCategoryType("Árabe")).toBe("arabe");
    expect(normalizeCategoryType("Nicho")).toBe("niche");
    expect(normalizeYear("2022")).toBe(2022);
    expect(normalizeYear("século passado")).toBeNull();
  });

  it("joins pyramid layers with the exact separator and removes blanks and duplicates", () => {
    expect(
      normalizePyramid({
        top: [" Maçã ", "", "Bergamota", "maçã"],
        heart: ["Lavanda", "Sálvia", " LAVANDA "],
        base: ["Cedro", "Fava tonka"],
      }),
    ).toEqual({
      top: "Maçã - Bergamota",
      heart: "Lavanda - Sálvia",
      base: "Cedro - Fava tonka",
    });
  });

  it("formats accords without percent signs, deduplicated and descending", () => {
    expect(
      normalizeAccords([
        { name: " Aromático ", value: 75.4 },
        { name: "amadeirado", value: 61 },
        { name: "AROMÁTICO", value: 90 },
        { name: "", value: 100 },
        { name: "Fresco", value: Number.NaN },
        { name: "Especiado", value: 120 },
      ]),
    ).toBe("Especiado: 100\nAromático: 90\nAmadeirado: 61");
  });

  it("clamps percentages to integer values from zero through one hundred", () => {
    expect(clampPercent(-12)).toBe(0);
    expect(clampPercent(42.6)).toBe(43);
    expect(clampPercent(180)).toBe(100);
    expect(clampPercent(null)).toBeNull();
  });

  it("always removes the reference from original perfumes", () => {
    expect(
      normalizeRelationship({
        kind: "original",
        reference: "Y Eau de Parfum",
      }),
    ).toEqual({ inspirationKind: "original", inspiredBy: null });
  });

  it.each(["inspiration", "dupe"] as const)(
    "requires a non-empty reference for %s",
    (kind) => {
      expect(() =>
        normalizeRelationship({ kind, reference: " inspirado em " }),
      ).toThrow("Referência obrigatória");
    },
  );

  it("removes prefixes and only a source-supported reference brand", () => {
    expect(
      normalizeRelationship({
        kind: "inspiration",
        reference: "Inspirado em Yves Saint Laurent Y Eau de Parfum",
        referenceBrand: "Yves Saint Laurent",
        referenceBrandSupported: true,
      }),
    ).toEqual({
      inspirationKind: "inspiration",
      inspiredBy: "Y Eau de Parfum",
    });

    expect(
      normalizeRelationship({
        kind: "dupe",
        reference: "Boss Bottled",
        referenceBrand: "Boss",
        referenceBrandSupported: false,
      }),
    ).toEqual({
      inspirationKind: "dupe",
      inspiredBy: "Boss Bottled",
    });
  });

  it("keeps Fakhar Black reference brand-free and treats similarity alone as original", () => {
    expect(
      normalizeRelationship({
        kind: "inspiration",
        reference: "Yves Saint Laurent Y Eau de Parfum",
        referenceBrand: "Yves Saint Laurent",
        referenceBrandSupported: true,
      }),
    ).toEqual({
      inspirationKind: "inspiration",
      inspiredBy: "Y Eau de Parfum",
    });

    expect(
      normalizeRelationship({
        kind: "dupe",
        reference: "Y Eau de Parfum",
        similarityOnly: true,
      }),
    ).toEqual({ inspirationKind: "original", inspiredBy: null });
  });
});
