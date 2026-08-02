import "server-only";

import type { SearchProvider } from "./providers/types";
import { autofillQuerySchema } from "./schema";
import {
  classifySource,
  sourcePriority,
  type SourceClassificationPolicy,
} from "./source-classification";
import type {
  AutofillQuery,
  WebEvidence,
  WebSearchResult,
  WebSearchWarning,
} from "./types";

type ProviderOutcome =
  | { status: "fulfilled"; provider: string; hits: Awaited<ReturnType<SearchProvider["search"]>>["hits"] }
  | { status: "failed"; provider: string }
  | { status: "timeout"; provider: string };

function runProvider(
  provider: SearchProvider,
  query: AutofillQuery,
  maxResults: number,
  timeoutMs: number,
  parentSignal?: AbortSignal,
): Promise<ProviderOutcome> {
  const controller = new AbortController();

  return new Promise((resolve, reject) => {
    let finished = false;
    const onAbort = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      controller.abort(parentSignal?.reason);
      reject(new DOMException("Operação cancelada.", "AbortError"));
    };
    const finish = (outcome: ProviderOutcome) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      parentSignal?.removeEventListener("abort", onAbort);
      resolve(outcome);
    };
    const timer = setTimeout(() => {
      controller.abort();
      finish({ status: "timeout", provider: provider.name });
    }, timeoutMs);
    if (parentSignal?.aborted) {
      onAbort();
      return;
    }
    parentSignal?.addEventListener("abort", onAbort, { once: true });

    provider
      .search(query, { maxResults, signal: controller.signal })
      .then((result) =>
        finish({
          status: "fulfilled",
          provider: provider.name,
          hits: result.hits,
        }),
      )
      .catch(() => finish({ status: "failed", provider: provider.name }));
  });
}

function canonicalize(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

export async function searchWebEvidence(
  queryInput: AutofillQuery,
  options: {
    providers: readonly SearchProvider[];
    sourcePolicy: SourceClassificationPolicy;
    maxResults: number;
    maxContentChars: number;
    timeoutMs: number;
    signal?: AbortSignal;
    now?: () => Date;
  },
): Promise<WebSearchResult> {
  const query = autofillQuerySchema.parse(queryInput);
  const maxResults = Math.max(1, Math.trunc(options.maxResults));
  const maxContentChars = Math.max(1, Math.trunc(options.maxContentChars));
  const timeoutMs = Math.max(1, Math.trunc(options.timeoutMs));
  const collectedAt = (options.now ?? (() => new Date()))().toISOString();
  const outcomes = await Promise.all(
    options.providers.map((provider) =>
      runProvider(provider, query, maxResults, timeoutMs, options.signal),
    ),
  );
  const warnings: WebSearchWarning[] = [];
  const deduplicated = new Map<string, WebEvidence>();

  for (const outcome of outcomes) {
    if (outcome.status === "failed") {
      warnings.push({
        code: "provider_failed",
        message: `O provider ${outcome.provider} não respondeu.`,
        provider: outcome.provider,
      });
      continue;
    }
    if (outcome.status === "timeout") {
      warnings.push({
        code: "provider_timeout",
        message: `O provider ${outcome.provider} excedeu o tempo limite.`,
        provider: outcome.provider,
      });
      continue;
    }

    for (const hit of outcome.hits.slice(0, maxResults)) {
      const canonicalUrl = canonicalize(hit.canonicalUrl);
      if (!canonicalUrl || deduplicated.has(canonicalUrl)) continue;
      deduplicated.set(canonicalUrl, {
        canonicalUrl,
        title: hit.title.trim(),
        excerpt: hit.excerpt.trim().slice(0, maxContentChars),
        sourceKind: classifySource(canonicalUrl, options.sourcePolicy),
        provider: outcome.provider,
        collectedAt,
      });
    }
  }

  const evidence = [...deduplicated.values()]
    .sort(
      (left, right) =>
        sourcePriority(left.sourceKind) - sourcePriority(right.sourceKind),
    )
    .slice(0, maxResults);

  if (evidence.length === 0) {
    warnings.push({
      code: "not_found",
      message: "Nenhuma fragrância foi encontrada.",
    });
  }

  return { evidence, warnings };
}
