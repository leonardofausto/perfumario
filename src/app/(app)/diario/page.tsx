import { UsageDiary } from "@/components/usage-log/usage-diary";
import { PageHeader } from "@/components/ui/page-header";
import { listOwnPerfumes } from "@/features/perfumes/queries";
import {
  listOwnUsages,
  type UsageListOptions,
} from "@/features/usage-log/repository";
import styles from "@/components/ui/workspace.module.css";

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function periodRange(period: string): Pick<UsageListOptions, "from" | "to"> {
  if (period === "all") return {};

  const now = new Date();
  const to = now.toISOString();
  const from = new Date(now);

  if (period === "today") {
    from.setHours(0, 0, 0, 0);
  } else if (period === "7d") {
    from.setDate(from.getDate() - 7);
  } else if (period === "30d") {
    from.setDate(from.getDate() - 30);
  } else {
    from.setMonth(0, 1);
    from.setHours(0, 0, 0, 0);
  }

  return { from: from.toISOString(), to };
}

export default async function UsageDiaryPage({
  searchParams = Promise.resolve({}),
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const period = ["today", "7d", "30d", "year", "all"].includes(
    first(params.period) ?? "",
  )
    ? (first(params.period) as "today" | "7d" | "30d" | "year" | "all")
    : "30d";
  const compliments = ["with", "without"].includes(
    first(params.compliments) ?? "",
  )
    ? (first(params.compliments) as "with" | "without")
    : "all";
  const order = first(params.order) === "oldest" ? "oldest" : "newest";
  const cursorUsedAt = first(params.cursorUsedAt);
  const cursorId = first(params.cursorId);

  const queryOptions: UsageListOptions = {
    ...periodRange(period),
    compliments,
    limit: 12,
    order,
    ...(cursorUsedAt && cursorId
      ? { cursor: { id: cursorId, usedAt: cursorUsedAt } }
      : {}),
  };
  const [perfumes, initialPage] = await Promise.all([
    listOwnPerfumes(),
    listOwnUsages(queryOptions),
  ]);

  return (
    <div className={styles.page}>
      <PageHeader
        description="Registre e acompanhe suas experiências."
        eyebrow="Memória olfativa"
        title="Diário de uso"
      />
      <UsageDiary
        filters={{ compliments, order, period }}
        initialPage={initialPage}
        perfumes={perfumes}
      />
    </div>
  );
}
