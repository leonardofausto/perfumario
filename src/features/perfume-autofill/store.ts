import "server-only";

import type { AutofillStore } from "./service";

interface QueryResult {
  data: unknown;
  error: { message?: string } | null;
}

interface CacheQuery {
  select(columns: string): CacheQuery;
  eq(column: string, value: string): CacheQuery;
  maybeSingle(): Promise<QueryResult>;
  upsert(
    value: Record<string, unknown>,
    options: { onConflict: string },
  ): Promise<QueryResult>;
}

interface AutofillSupabaseClient {
  from(table: string): CacheQuery;
  rpc(
    functionName: string,
    parameters: Record<string, unknown>,
  ): Promise<QueryResult>;
}

export class SupabaseAutofillStore implements AutofillStore {
  constructor(private readonly client: AutofillSupabaseClient) {}

  async get(input: { userId: string; key: string; now: Date }) {
    const { data, error } = await this.client
      .from("perfume_autofill_cache")
      .select("response,expires_at")
      .eq("user_id", input.userId)
      .eq("cache_key", input.key)
      .maybeSingle();

    if (error) throw new Error("Falha ao consultar o cache.");
    if (!data || typeof data !== "object") return null;

    const row = data as { response?: unknown; expires_at?: unknown };
    if (
      typeof row.expires_at !== "string" ||
      new Date(row.expires_at).getTime() <= input.now.getTime()
    ) {
      return null;
    }
    return row.response ?? null;
  }

  async set(input: Parameters<AutofillStore["set"]>[0]) {
    const { error } = await this.client
      .from("perfume_autofill_cache")
      .upsert(
        {
          user_id: input.userId,
          cache_key: input.key,
          response: input.value,
          expires_at: input.expiresAt.toISOString(),
        },
        { onConflict: "user_id,cache_key" },
      );
    if (error) throw new Error("Falha ao atualizar o cache.");
  }

  async consumeRateLimit(
    input: Parameters<AutofillStore["consumeRateLimit"]>[0],
  ) {
    const { data, error } = await this.client.rpc(
      "consume_perfume_autofill_quota",
      {
        p_user_id: input.userId,
        p_window_start: input.windowStart.toISOString(),
        p_limit: input.limit,
      },
    );
    if (error || typeof data !== "boolean") {
      throw new Error("Falha ao aplicar o limite operacional.");
    }
    return data;
  }
}
