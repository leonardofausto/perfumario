import "server-only";

import { createHash, randomUUID } from "node:crypto";

import { ConsolidationError } from "./consolidate";
import { normalizeName } from "./normalize";
import { autofillResponseSchema } from "./schema";
import type { AutofillQuery, AutofillResponse } from "./types";

export interface AutofillStore {
  get(input: {
    userId: string;
    key: string;
    now: Date;
  }): Promise<unknown | null>;
  set(input: {
    userId: string;
    key: string;
    value: AutofillResponse;
    expiresAt: Date;
  }): Promise<void>;
  consumeRateLimit(input: {
    userId: string;
    windowStart: Date;
    limit: number;
  }): Promise<boolean>;
}

export interface AutofillLogger {
  info(event: Record<string, unknown>): void;
  error(event: Record<string, unknown>): void;
}

export interface AutofillServiceOptions {
  store: AutofillStore;
  pipeline(
    query: AutofillQuery,
    options: { signal: AbortSignal },
  ): Promise<AutofillResponse>;
  contractVersion: string;
  cacheTtlSeconds: number;
  rateLimitMax: number;
  rateLimitWindowSeconds: number;
  timeoutMs: number;
  now?: () => Date;
  requestId?: () => string;
  logger: AutofillLogger;
}

export type AutofillServiceOutcome =
  | {
      status: "success" | "partial";
      cache: "hit" | "miss";
      data: AutofillResponse;
    }
  | { status: "not_found" | "rate_limited" | "timeout" | "invalid_model" }
  | { status: "internal_error" };

export class AutofillNotFoundError extends Error {
  constructor() {
    super("Nenhuma evidência encontrada.");
    this.name = "AutofillNotFoundError";
  }
}

export class AutofillTimeoutError extends Error {
  constructor() {
    super("O pipeline excedeu um limite de tempo.");
    this.name = "AutofillTimeoutError";
  }
}

function normalizeQuery(query: AutofillQuery): AutofillQuery {
  const name = normalizeName(query.name);
  const brand = query.brand ? normalizeName(query.brand) : undefined;
  return brand ? { name, brand } : { name };
}

export function buildAutofillCacheKey(
  query: AutofillQuery,
  contractVersion: string,
) {
  const normalized = normalizeQuery(query);
  return createHash("sha256")
    .update(
      JSON.stringify({
        version: contractVersion,
        name: normalized.name.toLocaleLowerCase("pt-BR"),
        brand: normalized.brand?.toLocaleLowerCase("pt-BR") ?? null,
      }),
    )
    .digest("hex");
}

function windowStart(now: Date, windowSeconds: number) {
  const windowMs = windowSeconds * 1_000;
  return new Date(Math.floor(now.getTime() / windowMs) * windowMs);
}

function isPartial(response: AutofillResponse) {
  return response.warnings.some(({ code }) =>
    ["provider_failed", "provider_timeout", "source_conflict"].includes(code),
  );
}

export async function executeAutofillRequest(
  input: {
    userId: string;
    query: AutofillQuery;
    ignoreCache: boolean;
  },
  options: AutofillServiceOptions,
): Promise<AutofillServiceOutcome> {
  const now = (options.now ?? (() => new Date()))();
  const requestId = (options.requestId ?? randomUUID)();
  const startedAt = Date.now();
  const query = normalizeQuery(input.query);
  const key = buildAutofillCacheKey(query, options.contractVersion);

  let allowed: boolean;
  try {
    allowed = await options.store.consumeRateLimit({
      userId: input.userId,
      windowStart: windowStart(now, options.rateLimitWindowSeconds),
      limit: options.rateLimitMax,
    });
  } catch {
    options.logger.error({
      event: "autofill.rate_limit_failed",
      requestId,
    });
    return { status: "internal_error" };
  }
  if (!allowed) {
    options.logger.info({ event: "autofill.rate_limited", requestId });
    return { status: "rate_limited" };
  }

  if (!input.ignoreCache) {
    let cached: unknown = null;
    try {
      cached = await options.store.get({
        userId: input.userId,
        key,
        now,
      });
    } catch {
      options.logger.error({
        event: "autofill.cache_read_failed",
        requestId,
      });
    }
    const parsedCache = autofillResponseSchema.safeParse(cached);
    if (parsedCache.success) {
      const cachedResponse = parsedCache.data as AutofillResponse;
      options.logger.info({
        event: "autofill.completed",
        requestId,
        cache: "hit",
        durationMs: Date.now() - startedAt,
      });
      return {
        status: isPartial(cachedResponse) ? "partial" : "success",
        cache: "hit",
        data: cachedResponse,
      };
    }
  }

  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new DOMException("Tempo limite excedido.", "AbortError"));
    }, options.timeoutMs);
  });

  try {
    const result = await Promise.race([
      options.pipeline(query, { signal: controller.signal }),
      deadline,
    ]);
    const parsedResponse = autofillResponseSchema.safeParse({
      ...result,
      query,
    });
    if (!parsedResponse.success) {
      options.logger.error({
        event: "autofill.invalid_model_output",
        requestId,
      });
      return { status: "invalid_model" };
    }
    const response = parsedResponse.data as AutofillResponse;

    try {
      await options.store.set({
        userId: input.userId,
        key,
        value: response,
        expiresAt: new Date(now.getTime() + options.cacheTtlSeconds * 1_000),
      });
    } catch {
      options.logger.error({
        event: "autofill.cache_write_failed",
        requestId,
      });
    }
    options.logger.info({
      event: "autofill.completed",
      requestId,
      cache: "miss",
      status: isPartial(response) ? "partial" : "success",
      sourceCount: response.sources.length,
      durationMs: Date.now() - startedAt,
    });
    return {
      status: isPartial(response) ? "partial" : "success",
      cache: "miss",
      data: response,
    };
  } catch (error) {
    if (controller.signal.aborted || error instanceof AutofillTimeoutError) {
      options.logger.info({ event: "autofill.timeout", requestId });
      return { status: "timeout" };
    }
    if (error instanceof ConsolidationError) {
      options.logger.error({
        event: "autofill.invalid_model_output",
        requestId,
      });
      return { status: "invalid_model" };
    }
    if (error instanceof AutofillNotFoundError) {
      options.logger.info({ event: "autofill.not_found", requestId });
      return { status: "not_found" };
    }
    options.logger.error({
      event: "autofill.failed",
      requestId,
      errorType: error instanceof Error ? error.name : "UnknownError",
    });
    return { status: "internal_error" };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
