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

function point(index: number, value: number, radius = 78) {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / PERFORMANCE_METRICS.length;
  const scaled = (radius * value) / 100;
  return `${100 + Math.cos(angle) * scaled},${100 + Math.sin(angle) * scaled}`;
}

export function PerformanceRadar({ scores }: { scores: PerfumeScore[] }) {
  const values = PERFORMANCE_METRICS.map(
    (metric) =>
      scores.find(
        (score) => score.category === "performance" && score.metricKey === metric,
      )?.score ?? null,
  );
  const polygon = values.map((value, index) => point(index, value ?? 0)).join(" ");
  const grid = PERFORMANCE_METRICS.map((_, index) => point(index, 100)).join(" ");

  return (
    <div className={styles.radarLayout}>
      <svg
        viewBox="0 0 200 200"
        className={styles.radar}
        role="img"
        aria-label="Gráfico de desempenho da fragrância"
      >
        <polygon points={grid} className={styles.radarGrid} />
        {[20, 40, 60, 80].map((level) => (
          <polygon
            key={level}
            points={PERFORMANCE_METRICS.map((_, index) => point(index, level)).join(
              " ",
            )}
            className={styles.radarGuide}
          />
        ))}
        <polygon points={polygon} className={styles.radarValue} />
        {PERFORMANCE_METRICS.map((_, index) => {
          const [cx, cy] = point(index, values[index] ?? 0).split(",");
          return <circle key={index} cx={cx} cy={cy} r="3" className={styles.radarDot} />;
        })}
      </svg>

      <ul className={styles.metricList}>
        {PERFORMANCE_METRICS.map((metric, index) => (
          <li key={metric}>
            {labels[metric]}:{" "}
            {values[index] === null ? "Não informado" : `${values[index]}%`}
          </li>
        ))}
      </ul>
    </div>
  );
}
