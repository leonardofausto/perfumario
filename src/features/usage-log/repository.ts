import "server-only";

import { requireUser } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";

import {
  usageCursorSchema,
  usageIdSchema,
  usageInputSchema,
  usagePageSizeSchema,
  usagePeriodSchema,
} from "./schema";
import type {
  UsageCursor,
  UsageInput,
  UsagePage,
  UsagePeriod,
  UsageRecord,
} from "./types";

type UsageRow = {
  id: string;
  user_id: string;
  perfume_id: string;
  used_at: string;
  occasion_key: UsageRecord["occasionKey"];
  time_key: UsageRecord["timeKey"];
  environment_key: UsageRecord["environmentKey"];
  compliments_count: number;
  satisfaction: number;
  performance_rating: number | null;
  weather_source: UsageRecord["weatherSource"];
  temperature: number | null;
  feels_like: number | null;
  weather_condition: string | null;
  season_key: UsageRecord["seasonKey"];
  city: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const USAGE_COLUMNS =
  "id, user_id, perfume_id, used_at, occasion_key, time_key, environment_key, compliments_count, satisfaction, performance_rating, weather_source, temperature, feels_like, weather_condition, season_key, city, notes, created_at, updated_at";

function assertQuerySucceeded(error: unknown) {
  if (error) {
    throw new Error("Não foi possível acessar o Diário de uso.");
  }
}

function mapUsage(row: UsageRow): UsageRecord {
  return {
    id: row.id,
    userId: row.user_id,
    perfumeId: row.perfume_id,
    usedAt: row.used_at,
    occasionKey: row.occasion_key,
    timeKey: row.time_key,
    environmentKey: row.environment_key,
    complimentsCount: row.compliments_count,
    satisfaction: row.satisfaction,
    performanceRating: row.performance_rating,
    weatherSource: row.weather_source,
    temperature: row.temperature,
    feelsLike: row.feels_like,
    weatherCondition: row.weather_condition,
    seasonKey: row.season_key,
    city: row.city,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowFromInput(userId: string, input: UsageInput) {
  return {
    user_id: userId,
    perfume_id: input.perfumeId,
    used_at: input.usedAt,
    occasion_key: input.occasionKey,
    time_key: input.timeKey,
    environment_key: input.environmentKey,
    compliments_count: input.complimentsCount,
    satisfaction: input.satisfaction,
    performance_rating: input.performanceRating,
    weather_source: input.weatherSource,
    temperature: input.temperature,
    feels_like: input.feelsLike,
    weather_condition: input.weatherCondition,
    season_key: input.seasonKey,
    city: input.city,
    notes: input.notes,
  };
}

export async function createOwnUsage(input: UsageInput): Promise<UsageRecord> {
  const usage = usageInputSchema.parse(input);
  const user = await requireUser();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("usage_logs")
    .insert(rowFromInput(user.id, usage))
    .select(USAGE_COLUMNS)
    .single();

  assertQuerySucceeded(error);
  return mapUsage(data as UsageRow);
}

export async function updateOwnUsage(
  id: string,
  input: UsageInput,
): Promise<UsageRecord> {
  const usageId = usageIdSchema.parse(id);
  const usage = usageInputSchema.parse(input);
  const user = await requireUser();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("usage_logs")
    .update(rowFromInput(user.id, usage))
    .eq("id", usageId)
    .eq("user_id", user.id)
    .select(USAGE_COLUMNS)
    .single();

  assertQuerySucceeded(error);
  return mapUsage(data as UsageRow);
}

export async function deleteOwnUsage(id: string): Promise<boolean> {
  const usageId = usageIdSchema.parse(id);
  const user = await requireUser();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("usage_logs")
    .delete()
    .eq("id", usageId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  assertQuerySucceeded(error);
  return data !== null;
}

export async function getOwnUsage(id: string): Promise<UsageRecord | null> {
  const usageId = usageIdSchema.parse(id);
  const user = await requireUser();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("usage_logs")
    .select(USAGE_COLUMNS)
    .eq("id", usageId)
    .eq("user_id", user.id)
    .maybeSingle();

  assertQuerySucceeded(error);
  return data ? mapUsage(data as UsageRow) : null;
}

export type UsageListOptions = {
  limit?: number;
  cursor?: UsageCursor;
  from?: string;
  to?: string;
  compliments?: "all" | "with" | "without";
  order?: "newest" | "oldest";
};

async function listOwned(
  options: UsageListOptions & { perfumeId?: string } = {},
): Promise<UsagePage> {
  const user = await requireUser();
  const supabase = await createServerSupabase();
  const limit = usagePageSizeSchema.parse(options.limit ?? 20);
  const cursor = options.cursor ? usageCursorSchema.parse(options.cursor) : null;

  if ((options.from && !options.to) || (!options.from && options.to)) {
    throw new Error("O período deve informar início e fim.");
  }
  const period =
    options.from && options.to
      ? usagePeriodSchema.parse({ from: options.from, to: options.to })
      : null;

  let query = supabase
    .from("usage_logs")
    .select(USAGE_COLUMNS)
    .eq("user_id", user.id);

  if (options.perfumeId) {
    query = query.eq("perfume_id", usageIdSchema.parse(options.perfumeId));
  }
  if (period) {
    query = query.gte("used_at", period.from).lt("used_at", period.to);
  }
  if (options.compliments === "with") {
    query = query.gt("compliments_count", 0);
  } else if (options.compliments === "without") {
    query = query.eq("compliments_count", 0);
  }

  const ascending = options.order === "oldest";
  if (cursor) {
    const operator = ascending ? "gt" : "lt";
    query = query.or(
      `used_at.${operator}.${cursor.usedAt},and(used_at.eq.${cursor.usedAt},id.${operator}.${cursor.id})`,
    );
  }

  const { data, error } = await query
    .order("used_at", { ascending })
    .order("id", { ascending })
    .limit(limit + 1);

  assertQuerySucceeded(error);
  const rows = (data ?? []) as UsageRow[];
  const hasNextPage = rows.length > limit;
  const visibleRows = rows.slice(0, limit);
  const last = visibleRows.at(-1);

  return {
    items: visibleRows.map(mapUsage),
    nextCursor:
      hasNextPage && last ? { usedAt: last.used_at, id: last.id } : null,
  };
}

export function listOwnUsages(options: UsageListOptions = {}) {
  return listOwned(options);
}

export function listOwnUsagesByPerfume(
  perfumeId: string,
  options: UsageListOptions = {},
) {
  return listOwned({ ...options, perfumeId });
}

export async function countOwnUsagesByPeriod(period: UsagePeriod): Promise<number> {
  const range = usagePeriodSchema.parse(period);
  const user = await requireUser();
  const supabase = await createServerSupabase();
  const { count, error } = await supabase
    .from("usage_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("used_at", range.from)
    .lt("used_at", range.to);

  assertQuerySucceeded(error);
  return count ?? 0;
}

export async function getOwnLatestUsage(
  perfumeId?: string,
): Promise<UsageRecord | null> {
  const user = await requireUser();
  const supabase = await createServerSupabase();
  let query = supabase
    .from("usage_logs")
    .select(USAGE_COLUMNS)
    .eq("user_id", user.id);

  if (perfumeId) {
    query = query.eq("perfume_id", usageIdSchema.parse(perfumeId));
  }

  const { data, error } = await query
    .order("used_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  assertQuerySucceeded(error);
  return data ? mapUsage(data as UsageRow) : null;
}

export async function sumOwnComplimentsByPerfume(
  perfumeId: string,
): Promise<number> {
  const ownedPerfumeId = usageIdSchema.parse(perfumeId);
  const user = await requireUser();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("usage_logs")
    .select("compliments_count")
    .eq("user_id", user.id)
    .eq("perfume_id", ownedPerfumeId);

  assertQuerySucceeded(error);
  return ((data ?? []) as Array<{ compliments_count: number }>).reduce(
    (total, usage) => total + usage.compliments_count,
    0,
  );
}
