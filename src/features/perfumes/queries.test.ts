import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerSupabase: vi.fn(),
  requireUser: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/session", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: mocks.createServerSupabase,
}));

import {
  getOwnPerfume,
  getOwnPerfumeDashboard,
  getOwnReplenishmentSummary,
  listOwnPerfumes,
  listOwnRecommenderPerfumes,
} from "./queries";

type QueryResult = { count?: number | null; data: unknown; error: unknown };

function query(result: QueryResult) {
  const builder = {
    eq: vi.fn(() => builder),
    in: vi.fn(() => builder),
    is: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => result),
    order: vi.fn(() => builder),
    select: vi.fn(() => builder),
    then: (
      resolve: (value: QueryResult) => unknown,
      reject?: (reason: unknown) => unknown,
    ) => Promise.resolve(result).then(resolve, reject),
  };

  return builder;
}

const perfumeRows = [
  {
    id: "perfume-2",
    brand: "Zeta",
    name: "Âmbar",
    concentration: "eau_de_parfum",
    bottle_format: "full_bottle",
    inspiration_kind: "original",
    inspired_by: null,
    olfactory_families: ["Amadeirado"],
    image_path: "user-1/perfume-2/cover.webp",
    is_favorite: false,
    launch_year: 2022,
    category_type: "designer",
    audience: "unissex",
    intensity: 80,
    sweetness: 25,
    freshness: 0,
    elegance: null,
    sensuality: 55,
    profile_tags: ["versatil"],
    container_level: "low",
    replenishment_intent: "buy_again",
    container_level_updated_at: "2026-08-03T12:00:00.000Z",
  },
  {
    id: "perfume-1",
    brand: "Alfa",
    name: "Brisa",
    concentration: "eau_de_toilette",
    bottle_format: "decant",
    inspiration_kind: "inspiration",
    inspired_by: "Referência",
    olfactory_families: ["Cítrico"],
    image_path: "user-1/perfume-1/cover.webp",
    is_favorite: true,
    launch_year: null,
    category_type: null,
    audience: null,
    intensity: null,
    sweetness: null,
    freshness: null,
    elegance: null,
    sensuality: null,
    profile_tags: [],
    container_level: "unknown",
    replenishment_intent: null,
    container_level_updated_at: null,
  },
];

describe("perfume queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUser.mockResolvedValue({ id: "user-1" });
  });

  it("returns favorites first and signs list images in one batch", async () => {
    const perfumesQuery = query({ data: perfumeRows, error: null });
    const createSignedUrls = vi.fn().mockResolvedValue({
      data: [
        { path: perfumeRows[0].image_path, signedUrl: "https://signed/amber" },
        { path: perfumeRows[1].image_path, signedUrl: "https://signed/brisa" },
      ],
      error: null,
    });
    mocks.createServerSupabase.mockResolvedValue({
      from: vi.fn(() => perfumesQuery),
      storage: { from: vi.fn(() => ({ createSignedUrls })) },
    });

    const result = await listOwnPerfumes();

    expect(result.map(({ id }) => id)).toEqual(["perfume-1", "perfume-2"]);
    expect(result[0].imageUrl).toBe("https://signed/brisa");
    expect(result[1]).toMatchObject({
      launchYear: 2022,
      freshness: 0,
      elegance: null,
      profileTags: ["versatil"],
      containerLevel: "low",
      replenishmentIntent: "buy_again",
    });
    expect(perfumesQuery.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(createSignedUrls).toHaveBeenCalledWith(
      [
        "user-1/perfume-2/cover.webp",
        "user-1/perfume-1/cover.webp",
      ],
      3600,
    );
  });

  it("loads and aggregates only the authenticated user's recommender history", async () => {
    const perfumeQuery = query({ data: [perfumeRows[0]], error: null });
    const scoresQuery = query({
      data: [
        {
          perfume_id: "perfume-2",
          category: "occasion",
          metric_key: "trabalho",
          score: 80,
        },
      ],
      error: null,
    });
    const usageQuery = query({
      data: [
        {
          perfume_id: "perfume-2",
          used_at: "2026-08-03T12:00:00.000Z",
          occasion_key: "trabalho",
          compliments_count: 0,
          satisfaction: 4,
          performance_rating: null,
          season_key: "inverno",
        },
      ],
      error: null,
    });
    const queue = [perfumeQuery, scoresQuery, usageQuery];
    const from = vi.fn(() => queue.shift());
    mocks.createServerSupabase.mockResolvedValue({
      from,
      storage: {
        from: vi.fn(() => ({
          createSignedUrls: vi.fn().mockResolvedValue({ data: [], error: null }),
        })),
      },
    });

    const result = await listOwnRecommenderPerfumes();

    expect(result[0]).toMatchObject({
      id: "perfume-2",
      history: {
        totalUses: 1,
        complimentsTotal: 0,
        satisfactionTotal: 4,
      },
    });
    expect(scoresQuery.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(usageQuery.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(usageQuery.in).toHaveBeenCalledWith("perfume_id", ["perfume-2"]);
  });

  it("loads a private replenishment summary from real perfume rows", async () => {
    const low = query({ count: 2, data: null, error: null });
    const empty = query({ count: 1, data: null, error: null });
    const buying = query({ count: 2, data: null, error: null });
    const undecided = query({ count: 1, data: null, error: null });
    const queries = [low, empty, buying, undecided];
    const queue = [...queries];
    mocks.createServerSupabase.mockResolvedValue({
      from: vi.fn(() => queue.shift()),
    });

    await expect(getOwnReplenishmentSummary()).resolves.toEqual({
      lowCount: 2,
      emptyCount: 1,
      purchaseIntentCount: 2,
      undecidedCount: 1,
    });
    for (const item of queries) {
      expect(item.eq).toHaveBeenCalledWith("user_id", "user-1");
    }
  });

  it("returns one owned perfume with ordered pyramid notes and scores", async () => {
    const parent = query({
      data: {
        ...perfumeRows[0],
        description: "Descrição",
        image_source_url: "https://brand.example/perfume",
        description_source_urls: ["https://brand.example/perfume"],
        created_at: "2026-07-26T10:00:00.000Z",
        updated_at: "2026-07-26T11:00:00.000Z",
      },
      error: null,
    });
    const notes = query({
      data: [
        { layer: "top", note: "Bergamota", display_order: 0 },
        { layer: "heart", note: "Cedro", display_order: 0 },
        { layer: "base", note: "Âmbar", display_order: 0 },
      ],
      error: null,
    });
    const scores = query({
      data: [{ category: "performance", metric_key: "fixacao", score: 80 }],
      error: null,
    });
    const createSignedUrl = vi.fn().mockResolvedValue({
      data: { signedUrl: "https://signed/detail" },
      error: null,
    });
    mocks.createServerSupabase.mockResolvedValue({
      from: vi.fn((table: string) => {
        if (table === "perfumes") return parent;
        if (table === "perfume_notes") return notes;
        return scores;
      }),
      storage: { from: vi.fn(() => ({ createSignedUrl })) },
    });

    const result = await getOwnPerfume("perfume-2");

    expect(result?.notes).toEqual({
      top: ["Bergamota"],
      heart: ["Cedro"],
      base: ["Âmbar"],
    });
    expect(result?.scores).toEqual([
      { category: "performance", metricKey: "fixacao", score: 80 },
    ]);
    expect(result).toMatchObject({
      launchYear: 2022,
      categoryType: "designer",
      audience: "unissex",
      intensity: 80,
      sweetness: 25,
      freshness: 0,
      elegance: null,
      sensuality: 55,
      profileTags: ["versatil"],
    });
    expect(result?.imageUrl).toBe("https://signed/detail");
    expect(parent.eq).toHaveBeenCalledWith("user_id", "user-1");
  });

  it("returns null when the perfume is missing or outside the owner scope", async () => {
    const parent = query({ data: null, error: null });
    mocks.createServerSupabase.mockResolvedValue({
      from: vi.fn(() => parent),
      storage: { from: vi.fn() },
    });

    await expect(getOwnPerfume("foreign-id")).resolves.toBeNull();
  });

  it("loads dashboard counts without fetching perfume detail fields", async () => {
    const allCount = query({ count: 4, data: null, error: null });
    const favoriteCount = query({ count: 2, data: null, error: null });
    const recent = query({ data: [perfumeRows[1]], error: null });
    const queue = [allCount, favoriteCount, recent];
    mocks.createServerSupabase.mockResolvedValue({
      from: vi.fn(() => queue.shift()),
      storage: {
        from: vi.fn(() => ({
          createSignedUrls: vi.fn().mockResolvedValue({
            data: [{ path: perfumeRows[1].image_path, signedUrl: "https://signed/brisa" }],
            error: null,
          }),
        })),
      },
    });

    const result = await getOwnPerfumeDashboard();

    expect(result).toEqual({
      totalCount: 4,
      favoriteCount: 2,
      recent: [
        expect.objectContaining({
          id: "perfume-1",
          imageUrl: "https://signed/brisa",
        }),
      ],
    });
  });

  it("keeps the dashboard available when remodel columns are not migrated yet", async () => {
    const allCount = query({ count: 4, data: null, error: null });
    const favoriteCount = query({ count: 2, data: null, error: null });
    const recentWithRemodelColumns = query({
      data: null,
      error: {
        code: "42703",
        message: "column perfumes.launch_year does not exist",
      },
    });
    const recentLegacyColumns = query({
      data: [
        {
          id: "legacy",
          brand: "Alfa",
          name: "Legado",
          concentration: "eau_de_parfum",
          bottle_format: "full_bottle",
          inspiration_kind: "original",
          inspired_by: null,
          olfactory_families: ["Amadeirado"],
          image_path: null,
          is_favorite: false,
        },
      ],
      error: null,
    });
    const queue = [
      allCount,
      favoriteCount,
      recentWithRemodelColumns,
      recentLegacyColumns,
    ];
    mocks.createServerSupabase.mockResolvedValue({
      from: vi.fn(() => queue.shift()),
      storage: {
        from: vi.fn(() => ({
          createSignedUrls: vi.fn(),
        })),
      },
    });

    const result = await getOwnPerfumeDashboard();

    expect(result.recent).toEqual([
      expect.objectContaining({
        id: "legacy",
        launchYear: null,
        intensity: null,
        profileTags: [],
      }),
    ]);
  });
});
