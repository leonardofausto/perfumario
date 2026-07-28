import { PERFORMANCE_METRICS } from "@/features/perfumes/constants";
import type { PerfumeScore } from "@/features/perfumes/types";

import styles from "./detail.module.css";

const labels: Record<(typeof PERFORMANCE_METRICS)[number], string> = {
  fixacao: "Fixação",
  projecao: "Projeção",
  rastro: "Rastro",
  versatilidade: "Versatilidade",
  presenca: "Presença",
};

export function PerformanceRadar({ scores }: { scores: PerfumeScore[] }) {
  const values = PERFORMANCE_METRICS.map(
    (metric) =>
      scores.find(
        (score) => score.category === "performance" && score.metricKey === metric,
      )?.score ?? null,
  );

  return (
    <ul className={styles.performanceBars} aria-label="Métricas de desempenho">
      {PERFORMANCE_METRICS.map((metric, index) => {
        const value = values[index];
        const formatted = value === null ? "Não informado" : `${value}%`;

        return (
          <li
            key={metric}
            className={value === null ? styles.performanceItemEmpty : styles.performanceItem}
          >
            <div className={styles.performanceHeader}>
              <strong>{labels[metric]}</strong>
              <span>{formatted}</span>
            </div>
            <span className={styles.performanceTrack} aria-hidden="true">
              {value === null ? null : (
                <span className={styles.performanceFill} style={{ width: `${value}%` }} />
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
