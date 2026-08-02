import "server-only";

import { z } from "zod";

import type { AutofillQuery } from "../types";
import { readLimitedResponseBody } from "../read-limited-body";
import type {
  ProviderSearchHit,
  ProviderSearchResult,
  SearchProvider,
  SearchProviderOptions,
} from "./types";

const TAVILY_ENDPOINT = "https://api.tavily.com/search";
const TAVILY_MAX_RESULTS = 10;
const TAVILY_MAX_RESPONSE_BYTES = 512_000;

const tavilyResponseSchema = z.object({
  results: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      content: z.string(),
    }),
  ),
});

function canonicalizeResultUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function mapHit(value: z.infer<typeof tavilyResponseSchema>["results"][number]) {
  const canonicalUrl = canonicalizeResultUrl(value.url);
  const title = value.title.trim();
  const excerpt = value.content.trim();
  return canonicalUrl && title
    ? ({ canonicalUrl, title, excerpt } satisfies ProviderSearchHit)
    : null;
}

export class TavilySearchProvider implements SearchProvider {
  readonly name = "tavily";
  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: { apiKey: string; fetchImpl?: typeof fetch }) {
    const apiKey = options.apiKey.trim();
    if (!apiKey) {
      throw new Error("TAVILY_API_KEY não configurada.");
    }

    this.apiKey = apiKey;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async search(
    query: AutofillQuery,
    options: SearchProviderOptions,
  ): Promise<ProviderSearchResult> {
    const maxResults = Math.min(
      TAVILY_MAX_RESULTS,
      Math.max(1, Math.trunc(options.maxResults)),
    );
    const searchQuery = [query.brand?.trim(), query.name.trim()]
      .filter(Boolean)
      .join(" ");
    const response = await this.fetchImpl(TAVILY_ENDPOINT, {
      body: JSON.stringify({
        query: searchQuery,
        search_depth: "basic",
        max_results: maxResults,
        include_answer: false,
        include_images: false,
        include_raw_content: false,
      }),
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      signal: options.signal,
    });

    if (!response.ok) {
      throw new Error(`Tavily respondeu com status ${response.status}.`);
    }

    const responseBody = await readLimitedResponseBody(
      response,
      TAVILY_MAX_RESPONSE_BYTES,
      "Resposta do provider excede o limite permitido.",
    );
    const data = tavilyResponseSchema.parse(JSON.parse(responseBody));
    return {
      provider: this.name,
      hits: data.results
        .map(mapHit)
        .filter((hit): hit is ProviderSearchHit => hit !== null)
        .slice(0, maxResults),
    };
  }
}
