import { Gauge, Radio, Shuffle, Sparkles, Waves } from "lucide-react";

import { PERFORMANCE_METRICS } from "@/features/perfumes/constants";
import type { PerfumeScore } from "@/features/perfumes/types";

import styles from "./detail.module.css";

const metrics = {
  fixacao: { label: "Fixação", Icon: Gauge },
  projecao: { label: "Projeção", Icon: Radio },
  rastro: { label: "Rastro", Icon: Waves },
  versatilidade: { label: "Versatilidade", Icon: Shuffle },
  presenca: { label: "Presença", Icon: Sparkles },
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
        const { Icon, label } = metrics[metric];

        return (
          <li
            key={metric}
            className={value === null ? styles.performanceItemEmpty : styles.performanceItem}
          >
            <Icon size={19} />
            <div className={styles.performanceHeader}>
              <span>
                {label}: {formatted}
              </span>
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
