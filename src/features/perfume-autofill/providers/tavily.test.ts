import { describe, expect, it, vi } from "vitest";

import { TavilySearchProvider } from "./tavily";

describe("TavilySearchProvider", () => {
  it.each([
    [{ name: "Fakhar Black" }, "Fakhar Black"],
    [{ name: "Fakhar Black", brand: "Lattafa" }, "Lattafa Fakhar Black"],
  ])("searches only with the normalized perfume identity", async (query, expected) => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [
            {
              title: "Fakhar Black",
              url: "https://example.com/fakhar-black#details",
              content: "Aromatic fragrance.",
            },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    const provider = new TavilySearchProvider({
      apiKey: "server-secret",
      fetchImpl,
    });

    await expect(provider.search(query, { maxResults: 50 })).resolves.toEqual({
      provider: "tavily",
      hits: [
        {
          canonicalUrl: "https://example.com/fakhar-black",
          title: "Fakhar Black",
          excerpt: "Aromatic fragrance.",
        },
      ],
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.tavily.com/search");
    expect(init.headers).toEqual({
      Authorization: "Bearer server-secret",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(init.body))).toEqual({
      query: expected,
      search_depth: "basic",
      max_results: 10,
      include_answer: false,
      include_images: false,
      include_raw_content: false,
    });
  });

  it("rejects missing credentials and provider failures without exposing secrets", async () => {
    expect(
      () => new TavilySearchProvider({ apiKey: "", fetchImpl: vi.fn() }),
    ).toThrow("TAVILY_API_KEY não configurada");

    const provider = new TavilySearchProvider({
      apiKey: "must-not-leak",
      fetchImpl: vi.fn().mockResolvedValue(new Response("denied", { status: 401 })),
    });

    await expect(
      provider.search({ name: "Fakhar Black" }, { maxResults: 5 }),
    ).rejects.toThrow("Tavily respondeu com status 401");
  });

  it("rejects provider payloads above the configured response limit", async () => {
    const provider = new TavilySearchProvider({
      apiKey: "server-secret",
      fetchImpl: vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            results: [
              {
                title: "Oversized",
                url: "https://example.com/oversized",
                content: "x".repeat(600_000),
              },
            ],
          }),
          { headers: { "content-type": "application/json" } },
        ),
      ),
    });

    await expect(
      provider.search({ name: "Fakhar Black" }, { maxResults: 5 }),
    ).rejects.toThrow("Resposta do provider excede o limite");
  });
});
