import { describe, expect, it, vi } from "vitest";

import { SupabaseAutofillStore } from "./store";

function query(result: unknown) {
  const builder = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(result),
    upsert: vi.fn().mockResolvedValue(result),
  };
  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  return builder;
}

describe("Supabase autofill store", () => {
  it("returns only unexpired cached values", async () => {
    const validQuery = query({
      data: {
        response: { cached: true },
        expires_at: "2026-08-02T12:01:00.000Z",
      },
      error: null,
    });
    const expiredQuery = query({
      data: {
        response: { stale: true },
        expires_at: "2026-08-02T11:59:00.000Z",
      },
      error: null,
    });
    const from = vi
      .fn()
      .mockReturnValueOnce(validQuery)
      .mockReturnValueOnce(expiredQuery);
    const store = new SupabaseAutofillStore({ from, rpc: vi.fn() });
    const input = {
      userId: "user-1",
      key: "cache-key",
      now: new Date("2026-08-02T12:00:00.000Z"),
    };

    await expect(store.get(input)).resolves.toEqual({ cached: true });
    await expect(store.get(input)).resolves.toBeNull();
  });

  it("upserts validated cache metadata and delegates quota consumption atomically", async () => {
    const cacheQuery = query({ data: null, error: null });
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    const store = new SupabaseAutofillStore({
      from: vi.fn().mockReturnValue(cacheQuery),
      rpc,
    });

    await store.set({
      userId: "user-1",
      key: "cache-key",
      value: { safe: true } as never,
      expiresAt: new Date("2026-08-02T12:01:00.000Z"),
    });
    await expect(
      store.consumeRateLimit({
        userId: "user-1",
        windowStart: new Date("2026-08-02T12:00:00.000Z"),
        limit: 5,
      }),
    ).resolves.toBe(true);

    expect(cacheQuery.upsert).toHaveBeenCalledWith(
      {
        user_id: "user-1",
        cache_key: "cache-key",
        response: { safe: true },
        expires_at: "2026-08-02T12:01:00.000Z",
      },
      { onConflict: "user_id,cache_key" },
    );
    expect(rpc).toHaveBeenCalledWith("consume_perfume_autofill_quota", {
      p_user_id: "user-1",
      p_window_start: "2026-08-02T12:00:00.000Z",
      p_limit: 5,
    });
  });

  it("fails closed on database errors", async () => {
    const failedQuery = query({
      data: null,
      error: { message: "database detail" },
    });
    const store = new SupabaseAutofillStore({
      from: vi.fn().mockReturnValue(failedQuery),
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "rpc detail" },
      }),
    });

    await expect(
      store.get({
        userId: "user-1",
        key: "key",
        now: new Date(),
      }),
    ).rejects.toThrow("cache");
    await expect(
      store.consumeRateLimit({
        userId: "user-1",
        windowStart: new Date(),
        limit: 5,
      }),
    ).rejects.toThrow("limite");
  });
});
