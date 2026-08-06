import styles from "@/components/analytics/analytics-view.module.css";

export default function AnalyticsLoading() {
  return (
    <div aria-label="Carregando análises" aria-live="polite" role="status">
      <div className={styles.loadingFilters} />
      <div className={styles.loadingMetrics} />
      <div className={styles.loadingChart} />
      <span className="sr-only">Carregando seus dados de análise</span>
    </div>
  );
}
