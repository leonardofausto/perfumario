import { describe, expect, it } from "vitest";

import {
  autofillQuerySchema,
  autofillResponseSchema,
  autofillSourceSchema,
} from "./schema";

const fieldMetadata = {
  confidence: 0.9,
  conflicts: [],
  inferred: false,
  origin: "official",
  sources: ["source-1"],
};

describe("perfume autofill schemas", () => {
  it("requires a perfume name and accepts an optional brand", () => {
    expect(
      autofillQuerySchema.parse({ name: "  Fakhar Black  ", brand: "  Lattafa  " }),
    ).toEqual({ name: "Fakhar Black", brand: "Lattafa" });
    expect(autofillQuerySchema.parse({ name: "Fakhar Black" })).toEqual({
      name: "Fakhar Black",
    });
    expect(autofillQuerySchema.safeParse({ name: "  " }).success).toBe(false);
  });

  it("models sources without trusting arbitrary extra properties", () => {
    expect(
      autofillSourceSchema.parse({
        id: "source-1",
        kind: "official",
        title: "Fakhar Black",
        url: "https://lattafa.com/fakhar-black",
      }),
    ).toEqual({
      id: "source-1",
      kind: "official",
      title: "Fakhar Black",
      url: "https://lattafa.com/fakhar-black",
    });
  });

  it("accepts field metadata and structurally rejects bottle format and image data", () => {
    const candidate = {
      query: { name: "Fakhar Black", brand: "Lattafa" },
      fields: {
        name: { ...fieldMetadata, value: "Fakhar Black" },
        brand: { ...fieldMetadata, value: "Lattafa" },
        description: { ...fieldMetadata, value: null },
        concentration: { ...fieldMetadata, value: "eau_de_parfum" },
        categoryType: { ...fieldMetadata, value: "arabe" },
        audience: { ...fieldMetadata, value: "masculine" },
        launchYear: { ...fieldMetadata, value: 2022 },
        inspirationKind: { ...fieldMetadata, value: "inspiration" },
        inspiredBy: { ...fieldMetadata, value: "Y Eau de Parfum" },
        olfactoryFamilies: { ...fieldMetadata, value: ["Aromático"] },
        pyramid: {
          ...fieldMetadata,
          value: {
            top: "Maçã - Bergamota",
            heart: "Lavanda - Sálvia",
            base: "Cedro - Fava tonka",
          },
        },
        accords: {
          ...fieldMetadata,
          value: "Aromático: 90\nAmadeirado: 75",
        },
        metrics: {
          ...fieldMetadata,
          value: {
            fixacao: 80,
            projecao: 75,
            rastro: 70,
            versatilidade: 85,
            presenca: 75,
            intensity: 80,
            sweetness: 55,
            freshness: 70,
            elegance: 75,
            sensuality: 65,
            primavera: 70,
            verao: 60,
            outono: 85,
            inverno: 80,
            ar_livre: 60,
            casual: 80,
            encontro: 75,
            festa: 70,
            formal: 65,
            trabalho: 85,
            manha: 65,
            tarde: 75,
            noite: 80,
            madrugada: 55,
            fechado: 75,
          },
        },
      },
      sources: [
        {
          id: "source-1",
          kind: "official",
          title: "Fakhar Black",
          url: "https://lattafa.com/fakhar-black",
        },
      ],
      confidence: 0.73,
      explanation: "Síntese curta sustentada pelas fontes.",
      warnings: [],
    };

    expect(autofillResponseSchema.parse(candidate)).toEqual(candidate);
    expect(
      autofillResponseSchema.safeParse({
        ...candidate,
        bottleFormat: "full_bottle",
      }).success,
    ).toBe(false);
    expect(
      autofillResponseSchema.safeParse({
        ...candidate,
        imageUrl: "https://example.com/cover.webp",
      }).success,
    ).toBe(false);
    expect(
      autofillResponseSchema.safeParse({
        ...candidate,
        fields: {
          ...candidate.fields,
          image: { ...fieldMetadata, value: "https://example.com/cover.webp" },
        },
      }).success,
    ).toBe(false);
  });
});
