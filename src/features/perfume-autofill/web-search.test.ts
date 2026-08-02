import { describe, expect, it, vi } from "vitest";

import type { SearchProvider } from "./providers/types";
import { searchWebEvidence } from "./web-search";

const sourcePolicy = {
  officialHosts: ["lattafa.com"],
  specializedHosts: ["parfumo.com"],
  technicalHosts: [],
};

function provider(
  name: string,
  search: SearchProvider["search"],
): SearchProvider {
  return { name, search };
}

describe("searchWebEvidence", () => {
  it("prioritizes sources, deduplicates canonical URLs, and enforces limits", async () => {
    const longExcerpt = "x".repeat(200);
    const result = await searchWebEvidence(
      { name: "Fakhar Black", brand: "Lattafa" },
      {
        providers: [
          provider("one", vi.fn().mockResolvedValue({
            provider: "one",
            hits: [
              {
                canonicalUrl: "https://www.parfumo.com/Perfumes/Lattafa/Fakhar",
                title: "Parfumo",
                excerpt: "Specialized",
              },
              {
                canonicalUrl: "https://lattafa.com/fakhar-black",
                title: "Lattafa",
                excerpt: longExcerpt,
              },
            ],
          })),
          provider("two", vi.fn().mockResolvedValue({
            provider: "two",
            hits: [
              {
                canonicalUrl: "https://lattafa.com/fakhar-black#duplicate",
                title: "Duplicate",
                excerpt: "Must be removed",
              },
              {
                canonicalUrl: "https://community.example/fakhar",
                title: "Community",
                excerpt: "Community",
              },
            ],
          })),
        ],
        maxContentChars: 40,
        maxResults: 2,
        now: () => new Date("2026-08-02T20:00:00.000Z"),
        sourcePolicy,
        timeoutMs: 100,
      },
    );

    expect(result.warnings).toEqual([]);
    expect(result.evidence).toEqual([
      {
        canonicalUrl: "https://lattafa.com/fakhar-black",
        collectedAt: "2026-08-02T20:00:00.000Z",
        excerpt: "x".repeat(40),
        provider: "one",
        sourceKind: "official",
        title: "Lattafa",
      },
      {
        canonicalUrl: "https://www.parfumo.com/Perfumes/Lattafa/Fakhar",
        collectedAt: "2026-08-02T20:00:00.000Z",
        excerpt: "Specialized",
        provider: "one",
        sourceKind: "specialized",
        title: "Parfumo",
      },
    ]);
  });

  it("returns valid partial results when providers fail or time out", async () => {
    const result = await searchWebEvidence(
      { name: "Fakhar Black" },
      {
        providers: [
          provider("valid", vi.fn().mockResolvedValue({
            provider: "valid",
            hits: [
              {
                canonicalUrl: "https://lattafa.com/fakhar-black",
                title: "Fakhar Black",
                excerpt: "Evidence",
              },
            ],
          })),
          provider("failed", vi.fn().mockRejectedValue(new Error("secret"))),
          provider("slow", vi.fn(() => new Promise<never>(() => undefined))),
        ],
        maxContentChars: 100,
        maxResults: 5,
        now: () => new Date("2026-08-02T20:00:00.000Z"),
        sourcePolicy,
        timeoutMs: 10,
      },
    );

    expect(result.evidence).toHaveLength(1);
    expect(result.warnings).toEqual([
      {
        code: "provider_failed",
        message: "O provider failed não respondeu.",
        provider: "failed",
      },
      {
        code: "provider_timeout",
        message: "O provider slow excedeu o tempo limite.",
        provider: "slow",
      },
    ]);
    expect(JSON.stringify(result)).not.toContain("secret");
  });

  it("returns an explicit not-found warning when no provider finds a fragrance", async () => {
    const result = await searchWebEvidence(
      { name: "Fragrância inexistente" },
      {
        providers: [
          provider("empty", vi.fn().mockResolvedValue({
            provider: "empty",
            hits: [],
          })),
        ],
        maxContentChars: 100,
        maxResults: 5,
        sourcePolicy,
        timeoutMs: 100,
      },
    );

    expect(result.evidence).toEqual([]);
    expect(result.warnings).toEqual([
      {
        code: "not_found",
        message: "Nenhuma fragrância foi encontrada.",
      },
    ]);
  });

  it("propagates caller cancellation to every provider", async () => {
    const controller = new AbortController();
    let providerSignal: AbortSignal | undefined;
    const pending = searchWebEvidence(
      { name: "Fakhar Black" },
      {
        providers: [
          provider("cancelled", vi.fn((_query, options) => {
            providerSignal = options.signal;
            return new Promise<never>((_, reject) => {
              options.signal?.addEventListener(
                "abort",
                () => reject(new DOMException("aborted", "AbortError")),
                { once: true },
              );
            });
          })),
        ],
        maxContentChars: 100,
        maxResults: 5,
        sourcePolicy,
        timeoutMs: 1_000,
        signal: controller.signal,
      },
    );

    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });

    expect(providerSignal?.aborted).toBe(true);
  });
});
