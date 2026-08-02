import type { AutofillQuery } from "../types";

export interface ProviderSearchHit {
  canonicalUrl: string;
  title: string;
  excerpt: string;
}

export interface ProviderSearchResult {
  provider: string;
  hits: ProviderSearchHit[];
}

export interface SearchProviderOptions {
  maxResults: number;
  signal?: AbortSignal;
}

export interface SearchProvider {
  readonly name: string;
  search(
    query: AutofillQuery,
    options: SearchProviderOptions,
  ): Promise<ProviderSearchResult>;
}
