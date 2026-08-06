import { describe, expect, it } from "vitest";

import type { RecommenderInput, RecommenderPerfume } from "./types";
import { scorePerfumes } from "./scoring";

function perfume(
  overrides: Partial<RecommenderPerfume> = {},
): RecommenderPerfume {
  return {
    id: "perfume",
    brand: "Marca",
    name: "Base",
    concentration: "eau_de_parfum",
    bottleFormat: "full_bottle",
    inspirationKind: "original",
    inspiredBy: null,
    olfactoryFamilies: ["Amadeirado"],
    imageUrl: null,
    isFavorite: false,
    launchYear: null,
    categoryType: null,
    audience: null,
    intensity: 70,
    sweetness: 60,
    freshness: 80,
    elegance: 65,
    sensuality: 55,
    profileTags: [],
    containerLevel: "unknown",
    replenishmentIntent: null,
    containerLevelUpdatedAt: null,
    scores: [
      { category: "season", metricKey: "verao", score: 80 },
      { category: "occasion", metricKey: "trabalho", score: 75 },
      { category: "time", metricKey: "manha", score: 70 },
      { category: "environment", metricKey: "fechado", score: 60 },
      { category: "performance", metricKey: "versatilidade", score: 85 },
      { category: "performance", metricKey: "fixacao", score: 50 },
      { category: "performance", metricKey: "projecao", score: 65 },
      { category: "performance", metricKey: "rastro", score: 55 },
      { category: "performance", metricKey: "presenca", score: 70 },
    ],
    ...overrides,
  };
}

function input(overrides: Partial<RecommenderInput> = {}): RecommenderInput {
  return {
    perfumes: [perfume()],
    contextMode: "automatic",
    climate: {
      cidade: "Volta Redonda",
      clima: "Ceu limpo",
      temperaturaCelsius: 30,
      estacao: "verao",
    },
    selection: {
      performance: ["fixacao", "presenca"],
      sensory: ["intensity", "freshness"],
      seasons: ["verao"],
      occasions: ["trabalho"],
      times: ["manha"],
      environments: ["fechado"],
    },
    ...overrides,
  };
}

describe("scorePerfumes", () => {
  it("keeps the exact previous result when the user has no history", () => {
    const withoutHistory = scorePerfumes(input())[0];
    const withEmptyHistory = scorePerfumes(
      input({ perfumes: [perfume({ history: undefined })] }),
    )[0];

    expect(withEmptyHistory.score).toBe(withoutHistory.score);
    expect(withEmptyHistory.historyAdjustment).toBe(0);
    expect(withEmptyHistory.historyReasons).toEqual([]);
  });

  it("limits historical impact and does not use container level as a signal", () => {
    const history = {
      totalUses: 8,
      complimentsTotal: 8,
      complimentedUses: 6,
      satisfactionTotal: 40,
      satisfactionCount: 8,
      performanceTotal: 40,
      performanceCount: 8,
      lastUsedAt: "2026-06-01T12:00:00.000Z",
      byOccasion: {},
      bySeason: {},
    };
    const full = scorePerfumes(
      input({
        now: "2026-08-03T12:00:00.000Z",
        perfumes: [perfume({ history, containerLevel: "full" })],
      }),
    )[0];
    const empty = scorePerfumes(
      input({
        now: "2026-08-03T12:00:00.000Z",
        perfumes: [perfume({ history, containerLevel: "empty" })],
      }),
    )[0];

    expect(Math.abs(full.historyAdjustment)).toBeLessThanOrEqual(5);
    expect(empty.score).toBe(full.score);
    expect(empty.availabilityNotice).toBe("Nível informado: Acabou.");
  });

  it("uses success in the active occasion only after equal main compatibility", () => {
    const successfulSample = {
      totalUses: 3,
      complimentsTotal: 3,
      complimentedUses: 3,
      satisfactionTotal: 15,
      satisfactionCount: 3,
      performanceTotal: 0,
      performanceCount: 0,
    };
    const neutralSample = {
      ...successfulSample,
      complimentsTotal: 0,
      complimentedUses: 0,
      satisfactionTotal: 9,
    };
    const common = {
      ...neutralSample,
      lastUsedAt: "2026-08-01T12:00:00.000Z",
      bySeason: {},
    };
    const successful = perfume({
      id: "successful",
      name: "Sucesso real",
      history: {
        ...successfulSample,
        lastUsedAt: common.lastUsedAt,
        byOccasion: { trabalho: successfulSample },
        bySeason: {},
      },
    });
    const neutral = perfume({
      id: "neutral",
      name: "Neutro",
      history: {
        ...common,
        byOccasion: { trabalho: neutralSample },
      },
    });

    const results = scorePerfumes(
      input({
        now: "2026-08-03T12:00:00.000Z",
        perfumes: [neutral, successful],
      }),
    );

    expect(results.map((result) => result.perfume.id)).toEqual([
      "successful",
      "neutral",
    ]);
    expect(results[0].historyReasons).toContain(
      "Costuma funcionar bem em trabalho.",
    );
  });

  it("calculates a normalized compatibility score from the real selection groups", () => {
    const [result] = scorePerfumes(input());

    expect(result.score).toBe(73);
    expect(result.contributions.map(({ criterion }) => criterion)).toEqual([
      "weather",
      "performance",
      "sensory",
      "season",
      "occasion",
      "time",
      "environment",
    ]);
  });

  it("uses multiple selections in the same group to influence ranking", () => {
    const balanced = perfume({
      id: "balanced",
      name: "Balanceado",
      scores: [
        { category: "performance", metricKey: "fixacao", score: 90 },
        { category: "performance", metricKey: "presenca", score: 90 },
      ],
    });
    const partial = perfume({
      id: "partial",
      name: "Parcial",
      scores: [
        { category: "performance", metricKey: "fixacao", score: 100 },
        { category: "performance", metricKey: "presenca", score: 20 },
      ],
    });

    const results = scorePerfumes(
      input({
        perfumes: [partial, balanced],
        climate: {
          cidade: "Curitiba",
          clima: null,
          temperaturaCelsius: null,
          estacao: null,
        },
        selection: {
          performance: ["fixacao", "presenca"],
          sensory: [],
          seasons: [],
          occasions: [],
          times: [],
          environments: [],
        },
      }),
    );

    expect(results.map((result) => result.perfume.id)).toEqual([
      "balanced",
      "partial",
    ]);
  });

  it("ignores incomplete fields and redistributes available weights", () => {
    const [result] = scorePerfumes(
      input({
        selection: {
          performance: ["versatilidade"],
          sensory: [],
          seasons: [],
          occasions: ["trabalho"],
          times: [],
          environments: [],
        },
        perfumes: [
          perfume({
            freshness: null,
            elegance: null,
            sensuality: null,
            sweetness: null,
            scores: [
              { category: "occasion", metricKey: "trabalho", score: 90 },
              { category: "performance", metricKey: "versatilidade", score: 30 },
            ],
          }),
        ],
      }),
    );

    expect(result.score).toBe(64);
    expect(result.contributions).toEqual([
      { criterion: "performance", score: 30, weight: 15 },
      { criterion: "occasion", score: 90, weight: 20 },
    ]);
  });

  it("keeps zero as a real score instead of treating it as missing", () => {
    const [result] = scorePerfumes(
      input({
        selection: {
          performance: [],
          sensory: [],
          seasons: [],
          occasions: ["trabalho"],
          times: [],
          environments: [],
        },
        climate: {
          cidade: "Curitiba",
          clima: null,
          temperaturaCelsius: null,
          estacao: null,
        },
        perfumes: [
          perfume({
            scores: [{ category: "occasion", metricKey: "trabalho", score: 0 }],
          }),
        ],
      }),
    );

    expect(result.score).toBe(0);
    expect(result.contributions).toEqual([
      { criterion: "occasion", score: 0, weight: 20 },
    ]);
  });

  it("keeps weather as a separate criterion from selected seasons", () => {
    const [result] = scorePerfumes(
      input({
        selection: {
          performance: [],
          sensory: [],
          seasons: ["inverno"],
          occasions: [],
          times: [],
          environments: [],
        },
        climate: {
          cidade: "Curitiba",
          clima: "Chuvoso",
          temperaturaCelsius: 12,
          estacao: "inverno",
        },
        perfumes: [
          perfume({
            sweetness: 90,
            sensuality: 85,
            scores: [{ category: "season", metricKey: "inverno", score: 95 }],
          }),
        ],
      }),
    );

    expect(result.contributions.map(({ criterion }) => criterion)).toEqual([
      "weather",
      "season",
    ]);
  });

  it("uses tie-breakers after equal final scores", () => {
    const betterWeather = perfume({
      id: "better-weather",
      name: "Brisa",
      freshness: 90,
      scores: [
        { category: "occasion", metricKey: "trabalho", score: 50 },
        { category: "performance", metricKey: "versatilidade", score: 40 },
        { category: "performance", metricKey: "fixacao", score: 40 },
      ],
    });
    const betterOccasion = perfume({
      id: "better-occasion",
      name: "Cedro",
      freshness: 50,
      scores: [
        { category: "occasion", metricKey: "trabalho", score: 50 },
        { category: "performance", metricKey: "versatilidade", score: 70 },
        { category: "performance", metricKey: "fixacao", score: 90 },
      ],
    });

    const results = scorePerfumes(
      input({
        perfumes: [betterOccasion, betterWeather],
        selection: {
          performance: [],
          sensory: [],
          seasons: [],
          occasions: ["trabalho"],
          times: [],
          environments: [],
        },
      }),
    );

    expect(results.map((result) => result.perfume.id)).toEqual([
      "better-weather",
      "better-occasion",
    ]);
  });

  it("accepts manual and automatic contexts as separate inputs", () => {
    const manual = scorePerfumes(
      input({
        contextMode: "manual",
        climate: {
          cidade: "Curitiba",
          clima: "Chuvoso",
          temperaturaCelsius: 12,
          estacao: "inverno",
        },
      }),
    )[0];
    const automatic = scorePerfumes(
      input({
        contextMode: "automatic",
        climate: {
          cidade: "Manaus",
          clima: "Ceu limpo",
          temperaturaCelsius: 34,
          estacao: "verao",
          sensacaoCelsius: 38,
          chuva: "Sem chuva",
          ventoKmh: 8,
        },
      }),
    )[0];

    expect(manual.score).not.toBe(automatic.score);
    expect(manual.perfume.id).toBe(automatic.perfume.id);
  });
});
