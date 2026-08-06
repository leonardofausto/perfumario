import { AnalyticsView } from "@/components/analytics/analytics-view";
import { PageHeader } from "@/components/ui/page-header";
import styles from "@/components/ui/workspace.module.css";
import { getOwnAnalyticsSnapshot } from "@/features/analytics/queries";
import {
  ANALYTICS_PERIODS,
  type AnalyticsPeriod,
} from "@/features/analytics/types";

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function validPeriod(value: string | undefined): value is AnalyticsPeriod {
  return ANALYTICS_PERIODS.some((period) => period === value);
}

function validTimezone(value: string | undefined): value is string {
  if (!value || value.length > 80) return false;
  try {
    new Intl.DateTimeFormat("pt-BR", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export default async function AnalyticsPage({
  searchParams = Promise.resolve({}),
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const requestedPeriod = first(params.period);
  const requestedTimezone = first(params.timezone);
  const period = validPeriod(requestedPeriod) ? requestedPeriod : "30d";
  const timezone = validTimezone(requestedTimezone)
    ? requestedTimezone
    : "America/Sao_Paulo";
  const snapshot = await getOwnAnalyticsSnapshot({ period, timezone });

  return (
    <div className={styles.page}>
      <PageHeader
        description="Entenda seus hábitos e preferências."
        eyebrow="Leitura da coleção"
        title="Análises"
      />
      <AnalyticsView snapshot={snapshot} />
    </div>
  );
}
