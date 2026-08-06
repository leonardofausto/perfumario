import "server-only";

import { requireUser } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";

import { normalizeSeries } from "./metrics";
import { analyticsFilterSchema } from "./schema";
import type { AnalyticsFilter, AnalyticsSnapshot } from "./types";

export async function getOwnAnalyticsSnapshot(
  input: AnalyticsFilter,
): Promise<AnalyticsSnapshot> {
  const filter = analyticsFilterSchema.parse(input);
  const user = await requireUser();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("get_analytics_snapshot", {
    p_user_id: user.id,
    p_period: filter.period,
    p_timezone: filter.timezone,
  });

  if (error || !data) {
    throw new Error("Não foi possível carregar as análises.");
  }

  const snapshot = data as AnalyticsSnapshot;
  return {
    ...snapshot,
    collection: {
      ...snapshot.collection,
      growth: normalizeSeries(
        snapshot.meta.buckets,
        snapshot.collection.growth,
        snapshot.collection.hasData,
      ),
    },
    usage: {
      ...snapshot.usage,
      series: normalizeSeries(
        snapshot.meta.buckets,
        snapshot.usage.series,
        snapshot.usage.hasData,
      ),
    },
  };
}
