import { DashboardOverview } from "@/components/dashboard/overview";
import { PageHeader } from "@/components/ui/page-header";
import styles from "@/components/ui/workspace.module.css";
import { getOwnDashboardOverview } from "@/features/dashboard/queries";
import type { DashboardPeriod } from "@/features/dashboard/types";

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isDashboardPeriod(value: string | undefined): value is DashboardPeriod {
  return value === "7d" || value === "30d" || value === "year";
}

export default async function DashboardPage({
  searchParams = Promise.resolve({}),
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const requestedPeriod = first(params.period);
  const period = isDashboardPeriod(requestedPeriod) ? requestedPeriod : "30d";
  const data = await getOwnDashboardOverview({
    period,
    timezone: "America/Sao_Paulo",
  });

  return (
    <div className={styles.page}>
      <PageHeader
        description="Como está sua coleção hoje?"
        eyebrow="Sua estante em movimento"
        title="Visão geral"
      />
      <DashboardOverview data={data} />
    </div>
  );
}
