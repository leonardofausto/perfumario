import {
  BriefcaseBusiness,
  Clock3,
  Coffee,
  Flower2,
  MoonStar,
  PartyPopper,
  Snowflake,
  Sparkles,
  Sun,
  Sunset,
  Trees,
  UsersRound,
} from "lucide-react";
import type { ComponentType } from "react";

import {
  OCCASION_METRICS,
  SEASON_METRICS,
  TIME_METRICS,
} from "@/features/perfumes/constants";
import type { PerfumeScore, ScoreCategory } from "@/features/perfumes/types";

import styles from "./detail.module.css";

type Metric = {
  key: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
};

const groups: Array<{ category: ScoreCategory; title: string; metrics: Metric[] }> = [
  {
    category: "season",
    title: "Clima e estações",
    metrics: [
      { key: SEASON_METRICS[0], label: "Primavera", icon: Flower2 },
      { key: SEASON_METRICS[1], label: "Verão", icon: Sun },
      { key: SEASON_METRICS[2], label: "Outono", icon: Trees },
      { key: SEASON_METRICS[3], label: "Inverno", icon: Snowflake },
    ],
  },
  {
    category: "occasion",
    title: "Ocasiões",
    metrics: [
      { key: OCCASION_METRICS[0], label: "Trabalho", icon: BriefcaseBusiness },
      { key: OCCASION_METRICS[1], label: "Casual", icon: Coffee },
      { key: OCCASION_METRICS[2], label: "Encontro", icon: Sparkles },
      { key: OCCASION_METRICS[3], label: "Formal", icon: UsersRound },
      { key: OCCASION_METRICS[4], label: "Festa", icon: PartyPopper },
      { key: OCCASION_METRICS[5], label: "Ar livre", icon: Trees },
    ],
  },
  {
    category: "time",
    title: "Melhor horário",
    metrics: [
      { key: TIME_METRICS[0], label: "Manhã", icon: Sun },
      { key: TIME_METRICS[1], label: "Tarde", icon: Sunset },
      { key: TIME_METRICS[2], label: "Noite", icon: MoonStar },
      { key: TIME_METRICS[3], label: "Madrugada", icon: Clock3 },
    ],
  },
];

export function SuitabilityGrid({ scores }: { scores: PerfumeScore[] }) {
  return (
    <div className={styles.suitabilityGroups}>
      {groups.map((group) => (
        <section key={group.category}>
          <h3>{group.title}</h3>
          <ul className={styles.suitabilityGrid}>
            {group.metrics.map((metric) => {
              const value =
                scores.find(
                  (score) =>
                    score.category === group.category &&
                    score.metricKey === metric.key,
                )?.score ?? null;
              const Icon = metric.icon;

              return (
                <li key={metric.key} className={styles.suitabilityItem}>
                  <Icon size={19} />
                  <span>
                    {metric.label}: {value === null ? "Não informado" : `${value}%`}
                  </span>
                  <span className={styles.scoreTrack} aria-hidden="true">
                    <span style={{ width: `${value ?? 0}%` }} />
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
