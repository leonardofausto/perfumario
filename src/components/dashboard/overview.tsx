import {
  ArrowRight,
  BarChart3,
  BookOpenText,
  CircleAlert,
  Heart,
  LibraryBig,
  MessageCircleHeart,
  NotebookPen,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import type { DashboardOverviewData, DashboardPeriod } from "@/features/dashboard/types";
import type { GroupMetric, SeriesPoint } from "@/features/analytics/types";

import styles from "./overview.module.css";

const periods: Array<{ label: string; value: DashboardPeriod }> = [
  { label: "7 dias", value: "7d" },
  { label: "30 dias", value: "30d" },
  { label: "Este ano", value: "year" },
];

function Metric({
  icon: Icon,
  label,
  metricName,
  value,
}: {
  icon: typeof LibraryBig;
  label: string;
  metricName: string;
  value: number | string;
}) {
  return (
    <article className={styles.metric}>
      <span aria-hidden="true"><Icon size={17} /></span>
      <p>{label}</p>
      <strong data-metric={metricName}>{value}</strong>
    </article>
  );
}

function MovementChart({ series }: { series: readonly SeriesPoint[] }) {
  const max = Math.max(...series.map((point) => point.value), 1);
  return (
    <div aria-label="Movimento recente" className={styles.movement} role="img">
      {series.map((point) => (
        <span
          aria-label={`${point.bucket}: ${point.value} usos`}
          className={styles.movementColumn}
          key={point.bucket}
          role="img"
          tabIndex={0}
        >
          <i style={{ height: point.value === 0 ? "0" : `${(point.value / max) * 100}%` }} />
          <b>{point.value}</b>
        </span>
      ))}
    </div>
  );
}

function Distribution({ groups }: { groups: readonly GroupMetric[] }) {
  const visible = groups.slice(0, 5);
  const max = Math.max(...visible.map((group) => group.value), 1);
  return (
    <ul aria-label="Distribuição por categoria" className={styles.distribution}>
      {visible.map((group) => (
        <li key={group.key}>
          <div><span>{group.key}</span><strong>{group.value}</strong></div>
          <span aria-hidden="true"><i style={{ width: `${(group.value / max) * 100}%` }} /></span>
        </li>
      ))}
    </ul>
  );
}

function SectionHeader({
  action,
  eyebrow,
  title,
}: {
  action?: { href: string; label: string };
  eyebrow: string;
  title: string;
}) {
  return (
    <header className={styles.sectionHeader}>
      <div><p>{eyebrow}</p><h2>{title}</h2></div>
      {action ? <Link href={action.href}>{action.label}<ArrowRight size={15} /></Link> : null}
    </header>
  );
}

function formatUsageDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

export function DashboardOverview({ data }: { data: DashboardOverviewData }) {
  const { snapshot, replenishment, recentUsages } = data;

  if (!snapshot.collection.hasData || snapshot.collection.total === 0) {
    return (
      <EmptyState
        action={{ href: "/colecao", icon: LibraryBig, label: "Adicionar fragrância" }}
        description="Cadastre sua primeira fragrância para acompanhar usos, preferências e níveis."
        icon={Sparkles}
        title="Sua estante começa na Minha estante"
      />
    );
  }

  const forgotten = snapshot.usage.forgotten.toSorted((left, right) => {
    if (left.daysSinceLastUse === null) return -1;
    if (right.daysSinceLastUse === null) return 1;
    return right.daysSinceLastUse - left.daysSinceLastUse;
  })[0];
  const hasAlerts =
    replenishment.lowCount +
      replenishment.emptyCount +
      replenishment.purchaseIntentCount +
      replenishment.undecidedCount >
    0;

  return (
    <div className={styles.overview}>
      <div className={styles.topline}>
        <nav aria-label="Período da Visão geral" className={styles.periods}>
          {periods.map((period) => (
            <Link
              aria-current={snapshot.meta.period === period.value ? "page" : undefined}
              href={`/dashboard?period=${period.value}`}
              key={period.value}
              scroll={false}
            >
              {period.label}
            </Link>
          ))}
        </nav>
        <div className={styles.quickLinks}>
          <Link href="/colecao">Minha estante</Link>
          <Link href="/diario">Diário</Link>
          <Link href="/analises">Análises</Link>
          <Link href="/recomendador">Recomendador</Link>
        </div>
      </div>

      <section aria-label="Estado da coleção" className={styles.metrics}>
        <Metric icon={LibraryBig} label="Fragrâncias" metricName="collection" value={snapshot.collection.total} />
        <Metric icon={Heart} label="Favoritas" metricName="favorites" value={snapshot.collection.favorites} />
        {snapshot.usage.hasData ? (
          <>
            <Metric icon={NotebookPen} label="Usos no período" metricName="usage" value={snapshot.usage.total} />
            <Metric icon={Star} label="Mais usada" metricName="most-used" value={snapshot.usage.mostUsed?.name ?? "Sem destaque"} />
          </>
        ) : null}
      </section>

      {!snapshot.usage.hasData ? (
        <section className={styles.diaryInvitation}>
          <span aria-hidden="true"><NotebookPen size={22} /></span>
          <div><h2>Sua coleção está pronta para ganhar memória</h2><p>Registre um uso real para acompanhar movimento e preferências.</p></div>
          <Link href="/diario">Registrar primeiro uso<ArrowRight size={15} /></Link>
        </section>
      ) : (
        <>
          <section className={styles.movementSection}>
            <SectionHeader action={{ href: "/analises", label: "Ver análises" }} eyebrow="Movimento recente" title="Ritmo da sua estante" />
            <MovementChart series={snapshot.usage.series} />
          </section>

          <section className={styles.highlights}>
            <SectionHeader eyebrow="Leituras rápidas" title="Destaques do período" />
            <div className={styles.highlightGrid}>
              <article><NotebookPen size={18} /><p>Mais usada</p><strong>{snapshot.usage.mostUsed?.name ?? "Sem destaque"}</strong><span>{snapshot.usage.mostUsed?.value ?? 0} usos</span></article>
              <article><MessageCircleHeart size={18} /><p>Mais elogiada</p><strong>{snapshot.compliments.mostComplimented?.name ?? "Nenhuma recebeu elogios"}</strong><span>{snapshot.compliments.total.value ?? 0} elogios</span></article>
              <article><Star size={18} /><p>Melhor satisfação</p><strong>{snapshot.satisfaction.bestAverage?.name ?? "Sem avaliação"}</strong><span>{snapshot.satisfaction.bestAverage ? `${snapshot.satisfaction.bestAverage.value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} de 5` : "Sem dados"}</span></article>
              <article><BookOpenText size={18} /><p>Fora da rotina</p><strong>{forgotten?.name ?? "Nenhuma esquecida"}</strong><span>{forgotten?.daysSinceLastUse === null ? "Nunca usada" : forgotten ? `${forgotten.daysSinceLastUse} dias sem uso` : "Boa rotação"}</span></article>
            </div>
          </section>
        </>
      )}

      <div className={styles.lowerGrid}>
        {hasAlerts ? (
          <section className={styles.attention}>
            <SectionHeader action={{ href: "/colecao", label: "Abrir Minha estante" }} eyebrow="Atenção à coleção" title="Níveis e decisões" />
            <ul>
              {replenishment.lowCount > 0 ? <li><CircleAlert /><span><strong>No final</strong>{replenishment.lowCount} itens</span></li> : null}
              {replenishment.emptyCount > 0 ? <li><CircleAlert /><span><strong>Acabou</strong>{replenishment.emptyCount} itens</span></li> : null}
              {replenishment.purchaseIntentCount > 0 ? <li><LibraryBig /><span><strong>Com intenção de compra</strong>{replenishment.purchaseIntentCount} itens</span></li> : null}
              {replenishment.undecidedCount > 0 ? <li><BarChart3 /><span><strong>Decisão pendente</strong>{replenishment.undecidedCount} itens</span></li> : null}
            </ul>
          </section>
        ) : null}

        {snapshot.collection.byCategory.length > 0 ? (
          <section className={styles.collectionMix}>
            <SectionHeader action={{ href: "/analises", label: "Explorar distribuição" }} eyebrow="Distribuição rápida" title="Perfil da coleção" />
            <Distribution groups={snapshot.collection.byCategory} />
          </section>
        ) : null}
      </div>

      {recentUsages.length > 0 ? (
        <section className={styles.recent}>
          <SectionHeader action={{ href: "/diario", label: "Abrir Diário" }} eyebrow="Últimos registros" title="Memória recente" />
          <ol>
            {recentUsages.map((usage) => (
              <li key={usage.id}>
                <time dateTime={usage.usedAt}>{formatUsageDate(usage.usedAt)}</time>
                <div><strong>{usage.perfumeName}</strong><span>{usage.perfumeBrand}</span></div>
                <span>{usage.complimentsCount === 0 ? "Nenhum elogio" : `${usage.complimentsCount} elogios`}</span>
                <b>Satisfação {usage.satisfaction}/5</b>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
