import type { PerfumeScore } from "@/features/perfumes/types";

import styles from "./detail.module.css";

const accordLabels: Record<string, string> = {
  amber: "Âmbar",
  ambar: "Âmbar",
  aromatic: "Aromático",
  aromatico: "Aromático",
  aquatico: "Aquático",
  baunilha: "Baunilha",
  caramel: "Caramelo",
  caramelo: "Caramelo",
  citrus: "Cítrico",
  citrico: "Cítrico",
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
  aquatico: "#8fd7e4",
  baunilha: "#ead7a0",
  caramel: "#c98c45",
  caramelo: "#c98c45",
  citrus: "#f2b632",
  citrico: "#f2b632",
  floral: "#f49abc",
  fresh: "#b8eef2",
  fresco: "#b8eef2",
  frutado: "#ff8165",
  fruity: "#ff8165",
  musk: "#e8dce6",
  musky: "#e8dce6",
  spicy: "#b75a36",
  doce: "#d97895",
  sweet: "#d97895",
  vanilla: "#ead7a0",
  verde: "#079323",
  woody: "#b79776",
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
  return accordColors[key] ?? "#887d6f";
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
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
