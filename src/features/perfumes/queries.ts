import "server-only";

import { requireUser } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";

import type {
  BottleFormat,
  Concentration,
  InspirationKind,
  NoteLayer,
  PerfumeDetail,
  PerfumeScore,
  PerfumeSummary,
  ScoreCategory,
} from "./types";

type PerfumeSummaryRow = {
  id: string;
  brand: string;
  name: string;
  concentration: Concentration;
  bottle_format: BottleFormat;
  inspiration_kind: InspirationKind;
  inspired_by: string | null;
  olfactory_families: string[];
  image_path: string | null;
  is_favorite: boolean;
  launch_year: number | null;
  category_type: string | null;
  audience: string | null;
  intensity: number | null;
  sweetness: number | null;
  freshness: number | null;
  elegance: number | null;
  sensuality: number | null;
  profile_tags: string[] | null;
};

type PerfumeDetailRow = PerfumeSummaryRow & {
  description: string;
  image_source_url: string | null;
  description_source_urls: string[];
  created_at: string;
  updated_at: string;
};

type NoteRow = {
  layer: NoteLayer;
  note: string;
  display_order: number;
};

type ScoreRow = {
  category: ScoreCategory;
  metric_key: string;
  score: number | null;
};

const SUMMARY_COLUMNS =
  "id, brand, name, concentration, bottle_format, inspiration_kind, inspired_by, olfactory_families, image_path, is_favorite, launch_year, category_type, audience, intensity, sweetness, freshness, elegance, sensuality, profile_tags";
const LEGACY_SUMMARY_COLUMNS =
  "id, brand, name, concentration, bottle_format, inspiration_kind, inspired_by, olfactory_families, image_path, is_favorite";

const DETAIL_COLUMNS = `${SUMMARY_COLUMNS}, description, image_source_url, description_source_urls, created_at, updated_at`;
const LEGACY_DETAIL_COLUMNS = `${LEGACY_SUMMARY_COLUMNS}, description, image_source_url, description_source_urls, created_at, updated_at`;

type QueryError = {
  code?: string;
  message?: string;
};

function assertQuerySucceeded(error: unknown): asserts error is null {
  if (error) {
    throw new Error("Não foi possível carregar a coleção de perfumes.");
  }
}

function isMissingRemodelColumnError(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const { code, message } = error as QueryError;

  return (
    code === "42703" ||
    (typeof message === "string" &&
      [
        "launch_year",
        "category_type",
        "audience",
        "intensity",
        "sweetness",
        "freshness",
        "elegance",
        "sensuality",
        "profile_tags",
      ].some((column) => message.includes(column)))
  );
}

function withRemodelDefaults(row: PerfumeSummaryRow): PerfumeSummaryRow {
  return {
    ...row,
    launch_year: row.launch_year ?? null,
    category_type: row.category_type ?? null,
    audience: row.audience ?? null,
    intensity: row.intensity ?? null,
    sweetness: row.sweetness ?? null,
    freshness: row.freshness ?? null,
    elegance: row.elegance ?? null,
    sensuality: row.sensuality ?? null,
    profile_tags: row.profile_tags ?? [],
  };
}

async function selectOwnPerfumeSummaries(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  userId: string,
  options: { orderByCreatedAt?: boolean; limit?: number } = {},
) {
  function build(columns: string) {
    let builder = supabase.from("perfumes").select(columns).eq("user_id", userId);

    if (options.orderByCreatedAt) {
      builder = builder.order("created_at", { ascending: false });
    } else {
      builder = builder
        .order("is_favorite", { ascending: false })
        .order("name", { ascending: true })
        .order("brand", { ascending: true });
    }

    return typeof options.limit === "number" ? builder.limit(options.limit) : builder;
  }

  const result = await build(SUMMARY_COLUMNS);

  if (!isMissingRemodelColumnError(result.error)) {
    return result;
  }

  const legacyResult = await build(LEGACY_SUMMARY_COLUMNS);

  return {
    ...legacyResult,
    data: legacyResult.data
      ? ((legacyResult.data as unknown as PerfumeSummaryRow[]).map(
          withRemodelDefaults,
        ) as unknown)
      : legacyResult.data,
  };
}

function compareSummaries(left: PerfumeSummary, right: PerfumeSummary) {
  if (left.isFavorite !== right.isFavorite) {
    return left.isFavorite ? -1 : 1;
  }

  const byName = left.name.localeCompare(right.name, "pt-BR", {
    sensitivity: "base",
  });

  return (
    byName ||
    left.brand.localeCompare(right.brand, "pt-BR", {
      sensitivity: "base",
    })
  );
}

function mapSummary(
  row: PerfumeSummaryRow,
  signedUrls: ReadonlyMap<string, string>,
): PerfumeSummary {
  return {
    id: row.id,
    brand: row.brand,
    name: row.name,
    concentration: row.concentration,
    bottleFormat: row.bottle_format,
    inspirationKind: row.inspiration_kind,
    inspiredBy: row.inspired_by,
    olfactoryFamilies: row.olfactory_families,
    imageUrl: row.image_path ? (signedUrls.get(row.image_path) ?? null) : null,
    isFavorite: row.is_favorite,
    launchYear: row.launch_year,
    categoryType: row.category_type,
    audience: row.audience,
    intensity: row.intensity,
    sweetness: row.sweetness,
    freshness: row.freshness,
    elegance: row.elegance,
    sensuality: row.sensuality,
    profileTags: row.profile_tags ?? [],
  };
}

async function signListImages(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  rows: PerfumeSummaryRow[],
) {
  const paths = [...new Set(rows.flatMap((row) => (row.image_path ? [row.image_path] : [])))];

  if (paths.length === 0) {
    return new Map<string, string>();
  }

  const { data, error } = await supabase.storage
    .from("perfume-images")
    .createSignedUrls(paths, 60 * 60);

  if (error || !data) {
    return new Map<string, string>();
  }

  return new Map(
    data.flatMap((item) =>
      item.path && item.signedUrl ? [[item.path, item.signedUrl] as const] : [],
    ),
  );
}

export async function listOwnPerfumes(): Promise<PerfumeSummary[]> {
  const user = await requireUser();
  const supabase = await createServerSupabase();
  const { data, error } = await selectOwnPerfumeSummaries(supabase, user.id);

  assertQuerySucceeded(error);

  const rows = (data ?? []) as PerfumeSummaryRow[];
  const signedUrls = await signListImages(supabase, rows);

  return rows.map((row) => mapSummary(row, signedUrls)).sort(compareSummaries);
}

export async function getOwnPerfume(id: string): Promise<PerfumeDetail | null> {
  const user = await requireUser();
  const supabase = await createServerSupabase();

  async function selectDetail(columns: string) {
    return supabase
    .from("perfumes")
      .select(columns)
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  }

  const detailResult = await selectDetail(DETAIL_COLUMNS);
  const { data, error } = isMissingRemodelColumnError(detailResult.error)
    ? await selectDetail(LEGACY_DETAIL_COLUMNS)
    : detailResult;

  if (error || !data) {
    return null;
  }

  const row = withRemodelDefaults(data as unknown as PerfumeDetailRow) as PerfumeDetailRow;
  const [notesResult, scoresResult, signedResult] = await Promise.all([
    supabase
      .from("perfume_notes")
      .select("layer, note, display_order")
      .eq("perfume_id", id)
      .eq("user_id", user.id)
      .order("display_order", { ascending: true }),
    supabase
      .from("perfume_scores")
      .select("category, metric_key, score")
      .eq("perfume_id", id)
      .eq("user_id", user.id)
      .order("category", { ascending: true })
      .order("metric_key", { ascending: true }),
    row.image_path
      ? supabase.storage
          .from("perfume-images")
          .createSignedUrl(row.image_path, 60 * 60)
      : Promise.resolve({ data: null, error: null }),
  ]);

  assertQuerySucceeded(notesResult.error);
  assertQuerySucceeded(scoresResult.error);

  const notes: Record<NoteLayer, string[]> = {
    top: [],
    heart: [],
    base: [],
  };

  for (const note of (notesResult.data ?? []) as NoteRow[]) {
    notes[note.layer].push(note.note);
  }

  const scores: PerfumeScore[] = ((scoresResult.data ?? []) as ScoreRow[]).map(
    (item) => ({
      category: item.category,
      metricKey: item.metric_key,
      score: item.score,
    }),
  );

  return {
    ...mapSummary(
      row,
      new Map(
        row.image_path && signedResult.data?.signedUrl
          ? [[row.image_path, signedResult.data.signedUrl]]
          : [],
      ),
    ),
    description: row.description,
    imagePath: row.image_path,
    imageSourceUrl: row.image_source_url,
    descriptionSourceUrls: row.description_source_urls,
    notes,
    scores,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getOwnPerfumeDashboard(): Promise<{
  totalCount: number;
  favoriteCount: number;
  recent: PerfumeSummary[];
}> {
  const user = await requireUser();
  const supabase = await createServerSupabase();
  const [totalResult, favoriteResult, recentResult] = await Promise.all([
    supabase
      .from("perfumes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("perfumes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_favorite", true),
    selectOwnPerfumeSummaries(supabase, user.id, {
      orderByCreatedAt: true,
      limit: 3,
    }),
  ]);

  assertQuerySucceeded(totalResult.error);
  assertQuerySucceeded(favoriteResult.error);
  assertQuerySucceeded(recentResult.error);

  const rows = (recentResult.data ?? []) as PerfumeSummaryRow[];
  const signedUrls = await signListImages(supabase, rows);

  return {
    totalCount: totalResult.count ?? 0,
    favoriteCount: favoriteResult.count ?? 0,
    recent: rows.map((row) => mapSummary(row, signedUrls)),
  };
}
