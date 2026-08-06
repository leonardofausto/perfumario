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
  countOwnUsagesByPeriod,
  createOwnUsage,
  deleteOwnUsage,
  getOwnLatestUsage,
  getOwnUsage,
  listOwnUsages,
  listOwnUsagesByPerfume,
  sumOwnComplimentsByPerfume,
  updateOwnUsage,
} from "./repository";

type Result = { count?: number | null; data: unknown; error: unknown };

function builder(result: Result) {
  const query = {
    delete: vi.fn(() => query),
    eq: vi.fn(() => query),
    gt: vi.fn(() => query),
    gte: vi.fn(() => query),
    insert: vi.fn(() => query),
    limit: vi.fn(() => query),
    lt: vi.fn(() => query),
    lte: vi.fn(() => query),
    maybeSingle: vi.fn(async () => result),
    or: vi.fn(() => query),
    order: vi.fn(() => query),
    select: vi.fn(() => query),
    single: vi.fn(async () => result),
    update: vi.fn(() => query),
    then: (
      resolve: (value: Result) => unknown,
      reject?: (reason: unknown) => unknown,
    ) => Promise.resolve(result).then(resolve, reject),
  };

  return query;
}

const input = {
  perfumeId: "11111111-1111-4111-8111-111111111111",
  usedAt: "2026-08-03T12:00:00.000Z",
  occasionKey: "trabalho" as const,
  timeKey: "manha" as const,
  environmentKey: "fechado" as const,
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

const row = {
  id: "22222222-2222-4222-8222-222222222222",
  user_id: "user-1",
  perfume_id: input.perfumeId,
  used_at: input.usedAt,
  occasion_key: input.occasionKey,
  time_key: input.timeKey,
  environment_key: input.environmentKey,
  compliments_count: 0,
  satisfaction: 4,
  performance_rating: null,
  weather_source: null,
  temperature: null,
  feels_like: null,
  weather_condition: null,
  season_key: null,
  city: null,
  notes: null,
  created_at: "2026-08-03T12:01:00.000Z",
  updated_at: "2026-08-03T12:01:00.000Z",
};

describe("usage log repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUser.mockResolvedValue({ id: "user-1" });
  });

  it("creates and updates only within the authenticated owner scope", async () => {
    const createQuery = builder({ data: row, error: null });
    const updateQuery = builder({ data: row, error: null });
    mocks.createServerSupabase
      .mockResolvedValueOnce({ from: vi.fn(() => createQuery) })
      .mockResolvedValueOnce({ from: vi.fn(() => updateQuery) });

    await expect(createOwnUsage(input)).resolves.toMatchObject({
      id: row.id,
      userId: "user-1",
      complimentsCount: 0,
    });
    await expect(updateOwnUsage(row.id, input)).resolves.toMatchObject({
      id: row.id,
    });

    expect(createQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "user-1", compliments_count: 0 }),
    );
    expect(updateQuery.eq).toHaveBeenCalledWith("id", row.id);
    expect(updateQuery.eq).toHaveBeenCalledWith("user_id", "user-1");
  });

  it("gets and deletes a usage with id plus owner filters", async () => {
    const getQuery = builder({ data: row, error: null });
    const deleteQuery = builder({ data: { id: row.id }, error: null });
    mocks.createServerSupabase
      .mockResolvedValueOnce({ from: vi.fn(() => getQuery) })
      .mockResolvedValueOnce({ from: vi.fn(() => deleteQuery) });

    await expect(getOwnUsage(row.id)).resolves.toMatchObject({ id: row.id });
    await expect(deleteOwnUsage(row.id)).resolves.toBe(true);

    expect(getQuery.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(deleteQuery.eq).toHaveBeenCalledWith("user_id", "user-1");
  });

  it("paginates newest-first with a stable usedAt and id cursor", async () => {
    const rows = [
      row,
      {
        ...row,
        id: "33333333-3333-4333-8333-333333333333",
        used_at: "2026-08-02T12:00:00.000Z",
      },
      {
        ...row,
        id: "44444444-4444-4444-8444-444444444444",
        used_at: "2026-08-01T12:00:00.000Z",
      },
    ];
    const listQuery = builder({ data: rows, error: null });
    mocks.createServerSupabase.mockResolvedValue({
      from: vi.fn(() => listQuery),
    });

    const result = await listOwnUsages({ limit: 2 });

    expect(listQuery.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(listQuery.limit).toHaveBeenCalledWith(3);
    expect(result.items).toHaveLength(2);
    expect(result.nextCursor).toEqual({
      usedAt: "2026-08-02T12:00:00.000Z",
      id: "33333333-3333-4333-8333-333333333333",
    });
  });

  it("applies both cursor fields when loading the next page", async () => {
    const listQuery = builder({ data: [], error: null });
    mocks.createServerSupabase.mockResolvedValue({
      from: vi.fn(() => listQuery),
    });

    await listOwnUsages({
      limit: 2,
      cursor: {
        usedAt: "2026-08-02T12:00:00.000Z",
        id: "33333333-3333-4333-8333-333333333333",
      },
    });

    expect(listQuery.or).toHaveBeenCalledWith(
      "used_at.lt.2026-08-02T12:00:00.000Z,and(used_at.eq.2026-08-02T12:00:00.000Z,id.lt.33333333-3333-4333-8333-333333333333)",
    );
  });

  it("supports perfume and period filters without removing owner scope", async () => {
    const perfumeQuery = builder({ data: [row], error: null });
    const countQuery = builder({ data: null, count: 1, error: null });
    mocks.createServerSupabase
      .mockResolvedValueOnce({ from: vi.fn(() => perfumeQuery) })
      .mockResolvedValueOnce({ from: vi.fn(() => countQuery) });

    await listOwnUsagesByPerfume(input.perfumeId, {
      from: "2026-08-01T00:00:00.000Z",
      to: "2026-08-04T00:00:00.000Z",
      limit: 20,
    });
    await expect(
      countOwnUsagesByPeriod({
        from: "2026-08-01T00:00:00.000Z",
        to: "2026-08-04T00:00:00.000Z",
      }),
    ).resolves.toBe(1);

    expect(perfumeQuery.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(perfumeQuery.eq).toHaveBeenCalledWith("perfume_id", input.perfumeId);
    expect(perfumeQuery.gte).toHaveBeenCalledWith(
      "used_at",
      "2026-08-01T00:00:00.000Z",
    );
    expect(perfumeQuery.lt).toHaveBeenCalledWith(
      "used_at",
      "2026-08-04T00:00:00.000Z",
    );
  });

  it("applies compliment and oldest-first filters at the private query seam", async () => {
    const listQuery = builder({ data: [], error: null });
    mocks.createServerSupabase.mockResolvedValue({
      from: vi.fn(() => listQuery),
    });

    await listOwnUsages({
      compliments: "with",
      order: "oldest",
      limit: 12,
    });

    expect(listQuery.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(listQuery.gt).toHaveBeenCalledWith("compliments_count", 0);
    expect(listQuery.order).toHaveBeenCalledWith("used_at", { ascending: true });
    expect(listQuery.order).toHaveBeenCalledWith("id", { ascending: true });
  });

  it("returns latest usage and sums real compliments for one perfume", async () => {
    const latestQuery = builder({ data: row, error: null });
    const complimentsQuery = builder({
      data: [{ compliments_count: 0 }, { compliments_count: 3 }],
      error: null,
    });
    mocks.createServerSupabase
      .mockResolvedValueOnce({ from: vi.fn(() => latestQuery) })
      .mockResolvedValueOnce({ from: vi.fn(() => complimentsQuery) });

    await expect(getOwnLatestUsage(input.perfumeId)).resolves.toMatchObject({
      id: row.id,
    });
    await expect(sumOwnComplimentsByPerfume(input.perfumeId)).resolves.toBe(3);

    expect(latestQuery.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(complimentsQuery.eq).toHaveBeenCalledWith("user_id", "user-1");
  });
});
