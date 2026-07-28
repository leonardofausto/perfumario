import type { PerfumeScore } from "@/features/perfumes/types";

import styles from "./detail.module.css";

const accordLabels: Record<string, string> = {
  amber: "Ambar",
  ambar: "Ambar",
  aromatic: "Aromatico",
  aromatico: "Aromatico",
  aquatico: "Aquatico",
  baunilha: "Baunilha",
  caramel: "Caramelo",
  caramelo: "Caramelo",
  citrus: "Citrico",
  citrico: "Citrico",
  floral: "Floral",
  fresh: "Fresco",
  fresco: "Fresco",
  frutado: "Frutado",
  fruity: "Frutado",
  musk: "Almiscarado",
  musky: "Almiscarado",
  spicy: "Especiado",
  doce: "Doce",
  sweet: "Doce",
  vanilla: "Baunilha",
  verde: "Verde",
  woody: "Amadeirado",
};

const accordColors: Record<string, string> = {
  amber: "#a76d2b",
  ambar: "#a76d2b",
  aromatic: "#66885d",
  aromatico: "#66885d",
  aquatico: "#387888",
  baunilha: "#9a7628",
  caramel: "#a86925",
  caramelo: "#a86925",
  citrus: "#a66f13",
  citrico: "#a66f13",
  floral: "#9b5d65",
  fresh: "#3e7080",
  fresco: "#3e7080",
  frutado: "#a95845",
  fruity: "#a95845",
  musk: "#74516c",
  musky: "#74516c",
  spicy: "#9b563c",
  doce: "#a45570",
  sweet: "#a45570",
  vanilla: "#9a7628",
  verde: "#315d46",
  woody: "#7b6249",
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function labelFor(metricKey: string) {
  const key = normalize(metricKey);
  return accordLabels[key] ?? metricKey.trim();
}

function colorFor(metricKey: string) {
  const key = normalize(metricKey);
  return accordColors[key] ?? "#746958";
}

export function MainAccords({ scores }: { scores: PerfumeScore[] }) {
  const accords = scores
    .filter((score) => score.category === "accord" && score.score !== null)
    .sort((left, right) => (right.score ?? 0) - (left.score ?? 0));

  if (accords.length === 0) return null;

  return (
    <div className={styles.accordList}>
      {accords.map((accord) => {
        const label = labelFor(accord.metricKey);
        const value = accord.score ?? 0;

        return (
          <div
            className={styles.accordRow}
            key={accord.metricKey}
            aria-label={`${label}: ${value}%`}
          >
            <span
              className={styles.accordBar}
              style={{
                backgroundColor: colorFor(accord.metricKey),
                width: `${value}%`,
              }}
            >
              <span>{label}</span>
              <strong>{value}%</strong>
            </span>
          </div>
        );
      })}
    </div>
  );
}
