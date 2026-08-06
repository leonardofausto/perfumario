"use client";

import styles from "@/components/analytics/analytics-view.module.css";

export default function AnalyticsError({ reset }: { reset: () => void }) {
  return (
    <section className={styles.routeError}>
      <p>Análises indisponíveis</p>
      <h1>Não foi possível ler seus dados</h1>
      <span>Tente novamente para recarregar somente esta análise.</span>
      <button onClick={reset} type="button">Tentar novamente</button>
    </section>
  );
}
