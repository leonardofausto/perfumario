import "server-only";

import { requireUser } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";

import { journeyUsageFiltersSchema } from "./schema";
import type {
  JourneyMoment,
  JourneyPeriod,
  JourneyPerfumeSummary,
  JourneyUsageEntry,
  JourneyUsagePage,
} from "./types";

type UsageRow = {
  id: string;
  user_id: string;
  perfume_id: string | null;
  perfume_name_snapshot: string;
  brand_name_snapshot: string | null;
  image_path_snapshot: string | null;
  used_at: string;
  occasion: JourneyUsageEntry["occasion"];
  satisfaction: number | null;
  compliments_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const USAGE_COLUMNS =
  "id, user_id, perfume_id, perfume_name_snapshot, brand_name_snapshot, image_path_snapshot, used_at, occasion, satisfaction, compliments_count, notes, created_at, updated_at";

function mapEntry(row: UsageRow, imageUrl: string | null): JourneyUsageEntry {
  return {
    id: row.id,
    userId: row.user_id,
    perfumeId: row.perfume_id,
    perfumeNameSnapshot: row.perfume_name_snapshot,
    brandNameSnapshot: row.brand_name_snapshot,
    imagePathSnapshot: row.image_path_snapshot,
    imageUrl,
    usedAt: row.used_at,
    occasion: row.occasion,
    satisfaction: row.satisfaction,
    complimentsCount: row.compliments_count,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function periodStart(period: JourneyPeriod, now: Date) {
  if (period === "all") return null;
  if (period === "month") return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const days = period === "7d" ? 7 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function decodeCursor(cursor: string | null) {
  if (!cursor) return null;
  const separator = cursor.indexOf("|");
  if (separator <= 0) return null;
  return { usedAt: cursor.slice(0, separator), id: cursor.slice(separator + 1) };
}

function encodeCursor(entry: UsageRow) {
  return `${entry.used_at}|${entry.id}`;
}

function momentFromUsedAt(usedAt: string): JourneyMoment {
  const hour = new Date(usedAt).getHours();
  if (hour >= 5 && hour < 12) return "manha";
  if (hour >= 12 && hour < 18) return "tarde";
  if (hour >= 18 && hour < 24) return "noite";
  return "madrugada";
}

function mostFrequent<T extends string>(counts: Map<T, number>) {
  return [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "pt-BR"))[0]?.[0] ?? null;
}

async function signImages(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  rows: UsageRow[],
) {
  const paths = [...new Set(rows.flatMap((row) => (row.image_path_snapshot ? [row.image_path_snapshot] : [])))];
  if (paths.length === 0) return new Map<string, string>();

  const { data, error } = await supabase.storage.from("perfume-images").createSignedUrls(paths, 60 * 60);
  if (error || !data) return new Map<string, string>();

  return new Map(
    data.flatMap((item) => item.path && item.signedUrl ? [[item.path, item.signedUrl] as const] : []),
  );
}

export async function listOwnJourneyPage(
  rawFilters: Partial<Record<string, string | undefined>>,
): Promise<JourneyUsagePage> {
  const user = await requireUser();
  const filters = journeyUsageFiltersSchema.parse(rawFilters);
  const supabase = await createServerSupabase();
  const now = new Date();
  const start = periodStart(filters.period, now);
  const cursor = decodeCursor(filters.cursor);

  let query = supabase
    .from("perfume_usage_entries")
    .select(USAGE_COLUMNS)
    .eq("user_id", user.id)
    .order("used_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(filters.pageSize + 1);

  if (start) query = query.gte("used_at", start.toISOString());
  if (filters.query) query = query.ilike("perfume_name_snapshot", `%${filters.query}%`);
  if (cursor) {
    query = query.or(`used_at.lt.${cursor.usedAt},and(used_at.eq.${cursor.usedAt},id.lt.${cursor.id})`);
  }

  const { data, error } = await query;
  if (error) throw new Error("Nao foi possivel carregar o Diario.");

  const rows = (data ?? []) as UsageRow[];
  const visibleRows = rows.slice(0, filters.pageSize);
  const signedUrls = await signImages(supabase, visibleRows);
  const entries = visibleRows.map((row) => mapEntry(row, signedUrls.get(row.image_path_snapshot ?? "") ?? null));

  let monthQuery = supabase
    .from("perfume_usage_entries")
    .select(USAGE_COLUMNS)
    .eq("user_id", user.id)
    .gte("used_at", periodStart("month", now)!.toISOString())
    .order("used_at", { ascending: false });
  if (filters.query) monthQuery = monthQuery.ilike("perfume_name_snapshot", `%${filters.query}%`);
  const monthResult = await monthQuery;
  if (monthResult.error) throw new Error("Nao foi possivel carregar o resumo do Diario.");
  const monthRows = (monthResult.data ?? []) as UsageRow[];
  const counts = new Map<string, number>();
  for (const row of monthRows) counts.set(row.perfume_name_snapshot, (counts.get(row.perfume_name_snapshot) ?? 0) + 1);
  const mostUsed = [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "pt-BR"))[0]?.[0] ?? null;
  const latestRow = monthRows[0] ?? null;
  const latestUrls = await signImages(supabase, latestRow ? [latestRow] : []);

  return {
    entries,
    nextCursor: rows.length > filters.pageSize ? encodeCursor(visibleRows[visibleRows.length - 1]) : null,
    summary: {
      monthCount: monthRows.length,
      mostUsed,
      lastUsed: latestRow ? mapEntry(latestRow, latestUrls.get(latestRow.image_path_snapshot ?? "") ?? null) : null,
    },
  };
}

export async function getOwnJourneyPerfumeSummary(perfumeId: string): Promise<JourneyPerfumeSummary> {
  const user = await requireUser();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("perfume_usage_entries")
    .select("used_at, occasion, satisfaction, compliments_count")
    .eq("user_id", user.id)
    .eq("perfume_id", perfumeId)
    .order("used_at", { ascending: false });
  if (error) throw new Error("Nao foi possivel carregar o resumo da Jornada.");

  const rows = (data ?? []) as Array<{
    used_at: string;
    occasion: JourneyUsageEntry["occasion"];
    satisfaction: number | null;
    compliments_count: number;
  }>;
  const occasions = new Map<JourneyUsageEntry["occasion"], number>();
  const moments = new Map<JourneyMoment, number>();
  let satisfactionTotal = 0;
  let satisfactionCount = 0;
  let complimentsCount = 0;
  for (const row of rows) {
    occasions.set(row.occasion, (occasions.get(row.occasion) ?? 0) + 1);
    const moment = momentFromUsedAt(row.used_at);
    moments.set(moment, (moments.get(moment) ?? 0) + 1);
    complimentsCount += row.compliments_count;
    if (row.satisfaction !== null) {
      satisfactionTotal += row.satisfaction;
      satisfactionCount += 1;
    }
  }
  const frequentOccasion = mostFrequent(occasions);
  const favoriteMoment = mostFrequent(moments);
  return {
    usageCount: rows.length,
    lastUsedAt: rows[0]?.used_at ?? null,
    averageSatisfaction: satisfactionCount > 0 ? satisfactionTotal / satisfactionCount : null,
    complimentsCount,
    frequentOccasion,
    occasionCounts: Object.fromEntries(occasions),
    favoriteMoment,
    momentCounts: Object.fromEntries(moments),
  };
}
