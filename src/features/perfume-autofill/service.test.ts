import { describe, expect, it, vi } from "vitest";

import type { AutofillResponse } from "./types";
import {
  AutofillNotFoundError,
  AutofillTimeoutError,
  buildAutofillCacheKey,
  executeAutofillRequest,
  type AutofillStore,
} from "./service";

const unavailable = {
  value: null,
  confidence: 0,
  origin: "unavailable" as const,
  sources: [],
  conflicts: [],
  inferred: false,
};

function validResponse(): AutofillResponse {
  return {
    query: { name: "Fakhar Black", brand: "Lattafa" },
    fields: {
      name: { ...unavailable, value: "Fakhar Black", confidence: 0.95, origin: "official", sources: ["source-1"] },
      brand: { ...unavailable },
      description: { ...unavailable },
      concentration: { ...unavailable },
      categoryType: { ...unavailable },
      audience: { ...unavailable },
      launchYear: { ...unavailable },
      inspirationKind: { ...unavailable },
      inspiredBy: { ...unavailable },
      olfactoryFamilies: { ...unavailable },
      pyramid: { ...unavailable },
      accords: { ...unavailable },
      metrics: { ...unavailable },
    },
    sources: [
      {
        id: "source-1",
        kind: "official",
        title: "Fakhar Black",
        url: "https://lattafa.com/fakhar-black",
      },
    ],
    confidence: 0.08,
    explanation: "A fonte oficial sustenta o nome.",
    warnings: [],
  };
}

function store(overrides: Partial<AutofillStore> = {}): AutofillStore {
  return {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    consumeRateLimit: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
}

describe("autofill service", () => {
  it("normalizes and versions the cache key, then stores only a valid result", async () => {
    const cache = store();
    const pipeline = vi.fn().mockResolvedValue(validResponse());

    const outcome = await executeAutofillRequest(
      {
        userId: "user-1",
        query: { name: "  FAKHAR   BLACK ", brand: " LATTAFA " },
        ignoreCache: false,
      },
      {
        store: cache,
        pipeline,
        contractVersion: "v5",
        cacheTtlSeconds: 60,
        rateLimitMax: 5,
        rateLimitWindowSeconds: 60,
        timeoutMs: 1_000,
        now: () => new Date("2026-08-02T12:00:00.000Z"),
        logger: { info: vi.fn(), error: vi.fn() },
      },
    );

    expect(outcome).toMatchObject({
      status: "success",
      cache: "miss",
      data: { query: { name: "Fakhar Black", brand: "Lattafa" } },
    });
    expect(cache.set).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        key: buildAutofillCacheKey(
          { name: "Fakhar Black", brand: "Lattafa" },
          "v5",
        ),
        expiresAt: new Date("2026-08-02T12:01:00.000Z"),
      }),
    );
  });

  it("uses a valid cache hit and bypasses it with ignoreCache", async () => {
    const cached = validResponse();
    const cache = store({ get: vi.fn().mockResolvedValue(cached) });
    const pipeline = vi.fn().mockResolvedValue(cached);
    const options = {
      store: cache,
      pipeline,
      contractVersion: "v5",
      cacheTtlSeconds: 60,
      rateLimitMax: 5,
      rateLimitWindowSeconds: 60,
      timeoutMs: 1_000,
      logger: { info: vi.fn(), error: vi.fn() },
    };

    const hit = await executeAutofillRequest(
      {
        userId: "user-1",
        query: { name: "Fakhar Black", brand: "Lattafa" },
        ignoreCache: false,
      },
      options,
    );
    const ignored = await executeAutofillRequest(
      {
        userId: "user-1",
        query: { name: "Fakhar Black", brand: "Lattafa" },
        ignoreCache: true,
      },
      options,
    );

    expect(hit).toMatchObject({ status: "success", cache: "hit" });
    expect(ignored).toMatchObject({ status: "success", cache: "miss" });
    expect(pipeline).toHaveBeenCalledOnce();
  });

  it("misses expired or invalid cache entries and includes the contract version in the key", async () => {
    const cache = store({ get: vi.fn().mockResolvedValue({ invalid: true }) });
    const pipeline = vi.fn().mockResolvedValue(validResponse());

    await executeAutofillRequest(
      {
        userId: "user-1",
        query: { name: "Fakhar Black" },
        ignoreCache: false,
      },
      {
        store: cache,
        pipeline,
        contractVersion: "v5",
        cacheTtlSeconds: 60,
        rateLimitMax: 5,
        rateLimitWindowSeconds: 60,
        timeoutMs: 1_000,
        logger: { info: vi.fn(), error: vi.fn() },
      },
    );

    expect(pipeline).toHaveBeenCalledOnce();
    expect(buildAutofillCacheKey({ name: "Fakhar Black" }, "v5")).not.toBe(
      buildAutofillCacheKey({ name: "Fakhar Black" }, "v6"),
    );
  });

  it("stops before paid work when the identity exceeds the rate limit", async () => {
    const cache = store({
      consumeRateLimit: vi.fn().mockResolvedValue(false),
    });
    const pipeline = vi.fn();

    const outcome = await executeAutofillRequest(
      {
        userId: "user-1",
        query: { name: "Fakhar Black" },
        ignoreCache: false,
      },
      {
        store: cache,
        pipeline,
        contractVersion: "v5",
        cacheTtlSeconds: 60,
        rateLimitMax: 1,
        rateLimitWindowSeconds: 60,
        timeoutMs: 1_000,
        logger: { info: vi.fn(), error: vi.fn() },
      },
    );

    expect(outcome).toEqual({ status: "rate_limited" });
    expect(cache.get).not.toHaveBeenCalled();
    expect(pipeline).not.toHaveBeenCalled();
  });

  it("aborts the pipeline on timeout and does not cache the error", async () => {
    const cache = store();
    let receivedSignal: AbortSignal | undefined;
    const pipeline = vi.fn(
      async (_query: unknown, { signal }: { signal: AbortSignal }) => {
        receivedSignal = signal;
        await new Promise((resolve) =>
          signal.addEventListener("abort", resolve, { once: true }),
        );
        throw new DOMException("aborted", "AbortError");
      },
    );

    const outcome = await executeAutofillRequest(
      {
        userId: "user-1",
        query: { name: "Fakhar Black" },
        ignoreCache: false,
      },
      {
        store: cache,
        pipeline,
        contractVersion: "v5",
        cacheTtlSeconds: 60,
        rateLimitMax: 5,
        rateLimitWindowSeconds: 60,
        timeoutMs: 5,
        logger: { info: vi.fn(), error: vi.fn() },
      },
    );

    expect(outcome).toEqual({ status: "timeout" });
    expect(receivedSignal?.aborted).toBe(true);
    expect(cache.set).not.toHaveBeenCalled();
  });

  it("enforces the deadline even when a dependency ignores cancellation", async () => {
    const cache = store();
    const outcome = await executeAutofillRequest(
      {
        userId: "user-1",
        query: { name: "Fakhar Black" },
        ignoreCache: false,
      },
      {
        store: cache,
        pipeline: vi.fn(() => new Promise<never>(() => undefined)),
        contractVersion: "v5",
        cacheTtlSeconds: 60,
        rateLimitMax: 5,
        rateLimitWindowSeconds: 60,
        timeoutMs: 5,
        logger: { info: vi.fn(), error: vi.fn() },
      },
    );

    expect(outcome).toEqual({ status: "timeout" });
    expect(cache.set).not.toHaveBeenCalled();
  });

  it("maps a provider-level total timeout to the controlled timeout status", async () => {
    const cache = store();
    const outcome = await executeAutofillRequest(
      {
        userId: "user-1",
        query: { name: "Fakhar Black" },
        ignoreCache: false,
      },
      {
        store: cache,
        pipeline: vi.fn().mockRejectedValue(new AutofillTimeoutError()),
        contractVersion: "v5",
        cacheTtlSeconds: 60,
        rateLimitMax: 5,
        rateLimitWindowSeconds: 60,
        timeoutMs: 1_000,
        logger: { info: vi.fn(), error: vi.fn() },
      },
    );

    expect(outcome).toEqual({ status: "timeout" });
  });

  it("converts invalid AI output and total failures to controlled errors without caching", async () => {
    const invalidStore = store();
    const invalid = await executeAutofillRequest(
      {
        userId: "user-1",
        query: { name: "Fakhar Black" },
        ignoreCache: false,
      },
      {
        store: invalidStore,
        pipeline: vi.fn().mockResolvedValue({ bottleFormat: "full_bottle" }),
        contractVersion: "v5",
        cacheTtlSeconds: 60,
        rateLimitMax: 5,
        rateLimitWindowSeconds: 60,
        timeoutMs: 1_000,
        logger: { info: vi.fn(), error: vi.fn() },
      },
    );

    const failedStore = store();
    const failed = await executeAutofillRequest(
      {
        userId: "user-1",
        query: { name: "Fakhar Black" },
        ignoreCache: false,
      },
      {
        store: failedStore,
        pipeline: vi.fn().mockRejectedValue(new Error("secret-key-value")),
        contractVersion: "v5",
        cacheTtlSeconds: 60,
        rateLimitMax: 5,
        rateLimitWindowSeconds: 60,
        timeoutMs: 1_000,
        logger: { info: vi.fn(), error: vi.fn() },
      },
    );

    expect(invalid).toEqual({ status: "invalid_model" });
    expect(failed).toEqual({ status: "internal_error" });
    expect(invalidStore.set).not.toHaveBeenCalled();
    expect(failedStore.set).not.toHaveBeenCalled();
  });

  it("marks provider degradation as partial and logs only allowlisted metadata", async () => {
    const cache = store();
    const response = validResponse();
    response.warnings.push({
      code: "provider_failed",
      message: "Provider indisponível.",
    });
    const logger = { info: vi.fn(), error: vi.fn() };

    const outcome = await executeAutofillRequest(
      {
        userId: "user-1",
        query: { name: "Fakhar Black" },
        ignoreCache: false,
      },
      {
        store: cache,
        pipeline: vi.fn().mockResolvedValue(response),
        contractVersion: "v5",
        cacheTtlSeconds: 60,
        rateLimitMax: 5,
        rateLimitWindowSeconds: 60,
        timeoutMs: 1_000,
        requestId: () => "request-1",
        logger,
      },
    );

    expect(outcome).toMatchObject({ status: "partial" });
    const serializedLogs = JSON.stringify(logger.info.mock.calls);
    expect(serializedLogs).not.toContain("Fakhar Black");
    expect(serializedLogs).not.toContain("Lattafa");
    expect(serializedLogs).not.toContain("A fonte oficial");
    expect(serializedLogs).toContain("request-1");
  });

  it("returns not found without writing cache when providers found no evidence", async () => {
    const cache = store();
    const outcome = await executeAutofillRequest(
      {
        userId: "user-1",
        query: { name: "Inexistente" },
        ignoreCache: false,
      },
      {
        store: cache,
        pipeline: vi.fn().mockRejectedValue(new AutofillNotFoundError()),
        contractVersion: "v5",
        cacheTtlSeconds: 60,
        rateLimitMax: 5,
        rateLimitWindowSeconds: 60,
        timeoutMs: 1_000,
        logger: { info: vi.fn(), error: vi.fn() },
      },
    );

    expect(outcome).toEqual({ status: "not_found" });
    expect(cache.set).not.toHaveBeenCalled();
  });

  it("degrades cache failures but fails closed when rate limiting is unavailable", async () => {
    const logger = { info: vi.fn(), error: vi.fn() };
    const cacheFailure = store({
      get: vi.fn().mockRejectedValue(new Error("cache secret")),
      set: vi.fn().mockRejectedValue(new Error("write secret")),
    });
    const valid = await executeAutofillRequest(
      {
        userId: "user-1",
        query: { name: "Fakhar Black" },
        ignoreCache: false,
      },
      {
        store: cacheFailure,
        pipeline: vi.fn().mockResolvedValue(validResponse()),
        contractVersion: "v5",
        cacheTtlSeconds: 60,
        rateLimitMax: 5,
        rateLimitWindowSeconds: 60,
        timeoutMs: 1_000,
        logger,
      },
    );

    const rateFailure = store({
      consumeRateLimit: vi.fn().mockRejectedValue(new Error("quota secret")),
    });
    const blocked = await executeAutofillRequest(
      {
        userId: "user-1",
        query: { name: "Fakhar Black" },
        ignoreCache: false,
      },
      {
        store: rateFailure,
        pipeline: vi.fn(),
        contractVersion: "v5",
        cacheTtlSeconds: 60,
        rateLimitMax: 5,
        rateLimitWindowSeconds: 60,
        timeoutMs: 1_000,
        logger,
      },
    );

    expect(valid).toMatchObject({ status: "success" });
    expect(blocked).toEqual({ status: "internal_error" });
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain("secret");
  });
});
