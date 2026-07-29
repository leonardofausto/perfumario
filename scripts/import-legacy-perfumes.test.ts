import { describe, expect, it } from "vitest";

import {
  canonicalImagePath,
  planImport,
  validateManifest,
  type ImportManifestItem,
} from "./import-legacy-perfumes-core";

const item: ImportManifestItem = {
  legacyKey: "natura-essencial",
  brand: "Natura",
  name: "Essencial",
  description: "Descrição editorial ainda não cadastrada.",
  concentration: "other",
  bottleFormat: "full_bottle",
  inspirationKind: "original",
  inspiredBy: null,
  olfactoryFamilies: ["Não catalogada"],
  isFavorite: false,
  imageLocalPath: "public/images/perfumes/natura-essencial.png",
  imageSourceUrl: null,
  descriptionSourceUrls: [],
  launchYear: null,
  categoryType: null,
  audience: null,
  intensity: null,
  sweetness: null,
  freshness: null,
  elegance: null,
  sensuality: null,
  notes: { top: [], heart: [], base: [] },
  scores: [],
};

describe("legacy perfume importer", () => {
  it("rejects duplicate legacy keys and embedded user ids", () => {
    expect(() => validateManifest([item, item])).toThrow("legacyKey duplicada");
    expect(() =>
      validateManifest([{ ...item, userId: "hard-coded-user" } as ImportManifestItem]),
    ).toThrow("não pode conter userId");
  });

  it("requires provenance for researched external content", () => {
    expect(() =>
      validateManifest([
        {
          ...item,
          imageLocalPath: null,
          imageSourceUrl: "https://images.example/perfume.png",
        },
      ]),
    ).toThrow("imagem externa sem fonte de descrição");
  });

  it("derives the canonical owned WebP path", () => {
    expect(canonicalImagePath("user-1", "perfume-1")).toBe(
      "user-1/perfume-1/cover.webp",
    );
  });

  it("plans create, update, and skip operations idempotently", () => {
    expect(planImport([item], [])).toEqual([
      { legacyKey: item.legacyKey, operation: "create" },
    ]);
    expect(
      planImport([item], [
        { legacyKey: item.legacyKey, fingerprint: "different" },
      ]),
    ).toEqual([{ legacyKey: item.legacyKey, operation: "update" }]);

    const firstPlan = planImport([item], []);
    const imported = firstPlan.map(({ legacyKey }) => ({
      legacyKey,
      fingerprint: planImport.fingerprint(item),
    }));
    expect(planImport([item], imported)).toEqual([
      { legacyKey: item.legacyKey, operation: "skip" },
    ]);
  });
});
