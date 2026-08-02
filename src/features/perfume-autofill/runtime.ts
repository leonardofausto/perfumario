import "server-only";

import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

import { getAutofillEnv, getPublicEnv } from "@/lib/env";

import { consolidatePerfumeEvidence } from "./consolidate";
import { createOpenAIConsolidationModel } from "./openai-model";
import { TavilySearchProvider } from "./providers/tavily";
import { autofillResponseSchema } from "./schema";
import {
  AutofillNotFoundError,
  AutofillTimeoutError,
  executeAutofillRequest,
  type AutofillServiceOutcome,
} from "./service";
import { SupabaseAutofillStore } from "./store";
import type { AutofillQuery, AutofillResponse } from "./types";
import { searchWebEvidence } from "./web-search";

const CONTRACT_VERSION = "perfume-autofill-v5";
const sourcePolicy = {
  officialHosts: ["lattafa.com"],
  specializedHosts: ["parfumo.com", "fragrantica.com", "basenotes.com"],
  technicalHosts: [],
};

const logger = {
  info(event: Record<string, unknown>) {
    console.info(JSON.stringify(event));
  },
  error(event: Record<string, unknown>) {
    console.error(JSON.stringify(event));
  },
};

export async function executeConfiguredAutofill(input: {
  userId: string;
  query: AutofillQuery;
  ignoreCache: boolean;
}): Promise<AutofillServiceOutcome> {
  const env = getAutofillEnv();
  if (
    !env.PERFUME_AUTOFILL_ENABLED ||
    !env.TAVILY_API_KEY ||
    !env.OPENAI_API_KEY ||
    !env.SUPABASE_SECRET_KEY
  ) {
    logger.error({ event: "autofill.disabled" });
    return { status: "internal_error" };
  }

  const publicEnv = getPublicEnv();
  const supabase = createClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SECRET_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
  const store = new SupabaseAutofillStore(supabase as never);
  const provider = new TavilySearchProvider({ apiKey: env.TAVILY_API_KEY });
  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const model = createOpenAIConsolidationModel(openai as never, {
    model: env.PERFUME_AUTOFILL_MODEL,
  });

  return executeAutofillRequest(input, {
    store,
    contractVersion: CONTRACT_VERSION,
    cacheTtlSeconds: env.PERFUME_AUTOFILL_CACHE_TTL_SECONDS,
    rateLimitMax: env.PERFUME_AUTOFILL_RATE_LIMIT_MAX,
    rateLimitWindowSeconds: env.PERFUME_AUTOFILL_RATE_LIMIT_WINDOW_SECONDS,
    timeoutMs: env.PERFUME_AUTOFILL_REQUEST_TIMEOUT_MS,
    logger,
    async pipeline(query, { signal }) {
      const search = await searchWebEvidence(query, {
        providers: [provider],
        sourcePolicy,
        maxResults: env.PERFUME_AUTOFILL_MAX_RESULTS,
        maxContentChars: env.PERFUME_AUTOFILL_MAX_CONTENT_CHARS,
        timeoutMs: env.PERFUME_AUTOFILL_PROVIDER_TIMEOUT_MS,
        signal,
      });
      if (search.evidence.length === 0) {
        if (search.warnings.some(({ code }) => code === "provider_timeout")) {
          throw new AutofillTimeoutError();
        }
        if (search.warnings.some(({ code }) => code === "provider_failed")) {
          throw new Error("Todos os providers falharam.");
        }
        throw new AutofillNotFoundError();
      }

      const consolidated = await consolidatePerfumeEvidence(
        query,
        search.evidence,
        model,
        { signal },
      );
      const response = {
        ...consolidated,
        warnings: [
          ...consolidated.warnings,
          ...search.warnings.map((warning) => ({
            code: warning.code,
            message: warning.message,
          })),
        ],
      };
      return autofillResponseSchema.parse(response) as AutofillResponse;
    },
  });
}
