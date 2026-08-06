"use client";

import {
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Heart,
  LibraryBig,
  MessageCircleHeart,
  NotebookPen,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { lineChartPoints, maxGroupValue } from "@/features/analytics/presentation";
import type {
  AnalyticsMetric,
  AnalyticsPeriod,
  AnalyticsSnapshot,
  GroupMetric,
  PerfumeMetric,
  SeriesPoint,
} from "@/features/analytics/types";

import styles from "./analytics-view.module.css";

type Dimension = "usage" | "compliments" | "satisfaction" | "collection";

const periods: { label: string; value: AnalyticsPeriod }[] = [
  { label: "7 dias", value: "7d" },
  { label: "30 dias", value: "30d" },
  { label: "90 dias", value: "90d" },
  { label: "Este ano", value: "year" },
  { label: "Tudo", value: "all" },
];

const dimensions: { label: string; value: Dimension }[] = [
  { label: "Usos", value: "usage" },
  { label: "Elogios", value: "compliments" },
  { label: "Satisfação", value: "satisfaction" },
  { label: "Coleção", value: "collection" },
];

function metricValue(metric: AnalyticsMetric<number>, decimals = 0) {
  if (metric.status === "empty" || metric.value === null) return "Sem dados";
  return metric.value.toLocaleString("pt-BR", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
}

function MetricCard({
  icon: Icon,
  label,
  metric,
  metricName,
}: {
  icon: typeof NotebookPen;
  label: string;
  metric: string | number;
  metricName: string;
}) {
  return (
    <article className={styles.metricCard}>
      <div className={styles.metricLabel}>
        <span aria-hidden="true"><Icon size={17} /></span>
        {label}
      </div>
      <strong data-metric={metricName}>{metric}</strong>
    </article>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return <p className={styles.emptyPanel}>{message}</p>;
}

function LineChart({
  ariaLabel,
  series,
  unit,
}: {
  ariaLabel: string;
  series: readonly SeriesPoint[];
  unit: string;
}) {
  const points = lineChartPoints(series, 720, 220);
  if (points.length === 0) return <EmptyPanel message="Ainda não há dados para esta evolução." />;

  const path = points.map((point) => `${point.x},${point.y}`).join(" ");
  return (
    <div className={styles.chartScroll}>
      <svg aria-label={ariaLabel} className={styles.lineChart} role="img" viewBox="-12 -14 744 252">
        <line className={styles.axis} x1="0" x2="720" y1="220" y2="220" />
        <polyline className={styles.areaLine} points={path} />
        {points.map((point) => (
          <g
            aria-label={`${point.bucket}: ${point.value} ${unit}`}
            className={styles.chartPoint}
            key={point.bucket}
            role="img"
            tabIndex={0}
          >
            <title>{`${point.bucket}: ${point.value} ${unit}`}</title>
            <circle cx={point.x} cy={point.y} r="6" />
          </g>
        ))}
      </svg>
    </div>
  );
}

function Bars({ groups, label }: { groups: readonly GroupMetric[]; label: string }) {
  const max = maxGroupValue(groups);
  if (groups.length === 0 || max === 0) {
    return <EmptyPanel message="Sem observações suficientes neste período." />;
  }

  return (
    <ul aria-label={label} className={styles.bars}>
      {groups.slice(0, 6).map((group) => (
        <li key={group.key}>
          <div><span>{group.key}</span><strong>{group.value.toLocaleString("pt-BR")}</strong></div>
          <span aria-hidden="true" className={styles.barTrack}>
            <span style={{ width: `${(group.value / max) * 100}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function Ranking({ items }: { items: (PerfumeMetric | null)[] }) {
  const visible = items.filter((item): item is PerfumeMetric => item !== null);
  if (visible.length === 0) return <EmptyPanel message="Nenhuma fragrância para destacar." />;

  return (
    <ol className={styles.ranking}>
      {visible.map((item, index) => (
        <li key={`${item.perfumeId}-${index}`}>
          <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          <strong>{item.name}</strong>
          <b>{item.value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}</b>
        </li>
      ))}
    </ol>
  );
}

function Panel({ children, eyebrow, title }: { children: ReactNode; eyebrow: string; title: string }) {
  return (
    <section className={styles.panel}>
      <header><p>{eyebrow}</p><h2>{title}</h2></header>
      {children}
    </section>
  );
}

function UsageAnalysis({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  return (
    <div className={styles.analysisGrid}>
      <Panel eyebrow="Ritmo" title="Evolução de usos">
        <LineChart ariaLabel="Evolução de usos" series={snapshot.usage.series} unit="usos" />
      </Panel>
      <Panel eyebrow="Fragrâncias" title="Frequência">
        <Ranking items={[snapshot.usage.mostUsed, snapshot.usage.leastUsed]} />
      </Panel>
      <Panel eyebrow="Rotação" title="Fora da rotina">
        {snapshot.usage.forgotten.length > 0 ? (
          <ul className={styles.forgotten}>
            {snapshot.usage.forgotten.slice(0, 5).map((perfume) => (
              <li key={perfume.perfumeId}>
                <strong>{perfume.name}</strong>
                <span>{perfume.daysSinceLastUse === null ? "Nunca usada" : `${perfume.daysSinceLastUse} dias sem uso`}</span>
              </li>
            ))}
          </ul>
        ) : <EmptyPanel message="Nenhuma fragrância esquecida neste período." />}
      </Panel>
    </div>
  );
}

function ComplimentAnalysis({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  return (
    <div className={styles.analysisGrid}>
      <Panel eyebrow="Contexto" title="Elogios por ocasião"><Bars groups={snapshot.compliments.byOccasion} label="Elogios por ocasião" /></Panel>
      <Panel eyebrow="Momento" title="Elogios por horário"><Bars groups={snapshot.compliments.byTime} label="Elogios por horário" /></Panel>
      <Panel eyebrow="Clima" title="Elogios por condição"><Bars groups={snapshot.compliments.byClimate} label="Elogios por clima" /></Panel>
      <Panel eyebrow="Destaque" title="Mais elogiada"><Ranking items={[snapshot.compliments.mostComplimented]} /></Panel>
    </div>
  );
}

function SatisfactionAnalysis({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  return (
    <div className={styles.analysisGrid}>
      <Panel eyebrow="Notas" title="Distribuição das notas"><Bars groups={snapshot.satisfaction.distribution} label="Distribuição da satisfação" /></Panel>
      <Panel eyebrow="Contexto" title="Satisfação por ocasião"><Bars groups={snapshot.satisfaction.byOccasion} label="Satisfação por ocasião" /></Panel>
      <Panel eyebrow="Clima" title="Satisfação por condição"><Bars groups={snapshot.satisfaction.byClimate} label="Satisfação por clima" /></Panel>
      <Panel eyebrow="Destaque" title="Melhor satisfação"><Ranking items={[snapshot.satisfaction.bestAverage]} /></Panel>
    </div>
  );
}

function CollectionAnalysis({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  const levels = [
    { key: "No final", value: snapshot.collection.low },
    { key: "Acabou", value: snapshot.collection.empty },
  ];
  return (
    <div className={styles.analysisGrid}>
      <Panel eyebrow="Estante" title="Evolução da coleção"><LineChart ariaLabel="Evolução da coleção" series={snapshot.collection.growth} unit="fragrâncias" /></Panel>
      <Panel eyebrow="Perfil" title="Categorias"><Bars groups={snapshot.collection.byCategory} label="Fragrâncias por categoria" /></Panel>
      <Panel eyebrow="Perfil" title="Concentrações"><Bars groups={snapshot.collection.byConcentration} label="Fragrâncias por concentração" /></Panel>
      <Panel eyebrow="Reposição" title="Níveis de atenção"><Bars groups={levels} label="Fragrâncias por nível qualitativo" /></Panel>
    </div>
  );
}

export function AnalyticsView({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  const [dimension, setDimension] = useState<Dimension>("usage");

  if (!snapshot.usage.hasData) {
    return (
      <EmptyState
        action={{ href: "/diario", icon: NotebookPen, label: "Registrar primeiro uso" }}
        description="Registre uma experiência real para começar a revelar seus hábitos."
        icon={ChartNoAxesColumnIncreasing}
        title="Seu diário ainda não tem usos"
      />
    );
  }

  return (
    <div className={styles.analytics}>
      <nav aria-label="Período das análises" className={styles.periods}>
        {periods.map((period) => {
          const query = new URLSearchParams({ period: period.value, timezone: snapshot.meta.timezone });
          return (
            <Link aria-current={snapshot.meta.period === period.value ? "page" : undefined} href={`/analises?${query}`} key={period.value} scroll={false}>
              {period.label}
            </Link>
          );
        })}
      </nav>
      <section aria-label="Indicadores do período" className={styles.metrics}>
        <MetricCard icon={CalendarDays} label="Usos" metric={snapshot.usage.total} metricName="usage" />
        <MetricCard icon={MessageCircleHeart} label="Elogios" metric={metricValue(snapshot.compliments.total)} metricName="compliments" />
        <MetricCard icon={LibraryBig} label="Fragrâncias usadas" metric={snapshot.usage.uniquePerfumes} metricName="fragrances" />
        <MetricCard icon={Star} label="Satisfação média" metric={metricValue(snapshot.satisfaction.average, 1)} metricName="satisfaction" />
      </section>
      <div className={styles.dimensionHeader}>
        <div><p>Leitura ativa</p><h2>Explore seus padrões</h2></div>
        <div aria-label="Dimensão das análises" className={styles.dimensions} role="group">
          {dimensions.map((item) => (
            <button aria-pressed={dimension === item.value} key={item.value} onClick={() => setDimension(item.value)} type="button">{item.label}</button>
          ))}
        </div>
      </div>
      <div aria-live="polite">
        {dimension === "usage" ? <UsageAnalysis snapshot={snapshot} /> : null}
        {dimension === "compliments" ? <ComplimentAnalysis snapshot={snapshot} /> : null}
        {dimension === "satisfaction" ? <SatisfactionAnalysis snapshot={snapshot} /> : null}
        {dimension === "collection" ? <CollectionAnalysis snapshot={snapshot} /> : null}
      </div>
      <footer className={styles.context}>
        <span><Sparkles aria-hidden="true" size={15} /> Dados do seu diário</span>
        <span><Heart aria-hidden="true" size={15} /> Sem estimativas</span>
      </footer>
    </div>
  );
}
