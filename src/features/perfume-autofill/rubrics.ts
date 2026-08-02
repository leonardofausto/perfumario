import {
  ENVIRONMENT_METRICS,
  OCCASION_METRICS,
  PERFORMANCE_METRICS,
  PERFUME_PERCENT_FIELDS,
  SEASON_METRICS,
  TIME_METRICS,
} from "@/features/perfumes/constants";

import { clampPercent } from "./normalize";

export const AUTOFILL_RUBRICS = {
  performance: PERFORMANCE_METRICS,
  sensory: PERFUME_PERCENT_FIELDS,
  usage: [
    ...SEASON_METRICS,
    ...OCCASION_METRICS,
    ...TIME_METRICS,
    ...ENVIRONMENT_METRICS,
  ],
} as const;

export const AUTOFILL_RUBRIC_BANDS = [
  { score: 0, label: "Sem sustentação" },
  { score: 25, label: "Baixo" },
  { score: 50, label: "Moderado" },
  { score: 75, label: "Alto" },
  { score: 100, label: "Muito alto" },
] as const;

export const AUTOFILL_RUBRIC_GUIDANCE = {
  fixacao: "Duração relatada na pele.",
  projecao: "Alcance percebido ao redor de quem usa.",
  rastro: "Persistência percebida no caminho de quem usa.",
  versatilidade: "Amplitude de contextos de uso sustentados pelas fontes.",
  presenca: "Impacto olfativo combinado, sem substituir fixação ou projeção.",
  intensity: "Força olfativa geral percebida.",
  sweetness: "Predominância de facetas doces.",
  freshness: "Predominância de facetas frescas.",
  elegance: "Percepção recorrente de refinamento nas fontes.",
  sensuality: "Percepção recorrente de sensualidade nas fontes.",
  primavera: "Adequação relatada para primavera.",
  verao: "Adequação relatada para verão.",
  outono: "Adequação relatada para outono.",
  inverno: "Adequação relatada para inverno.",
  ar_livre: "Adequação ao uso ao ar livre; a UI exibe Academia em ocasiões.",
  casual: "Adequação a ocasiões casuais.",
  encontro: "Adequação a encontros.",
  festa: "Adequação a festas.",
  formal: "Adequação a ocasiões formais.",
  trabalho: "Adequação ao trabalho.",
  manha: "Adequação ao período da manhã.",
  tarde: "Adequação ao período da tarde.",
  noite: "Adequação ao período da noite.",
  madrugada: "Chave histórica que a UI exibe como Dia Inteiro.",
  fechado: "Adequação a ambientes fechados.",
} as const;

type RubricKey =
  | (typeof AUTOFILL_RUBRICS.performance)[number]
  | (typeof AUTOFILL_RUBRICS.sensory)[number]
  | (typeof AUTOFILL_RUBRICS.usage)[number];

export function normalizeRubricScores(
  scores: Partial<Record<RubricKey, number | null>>,
) {
  return Object.fromEntries(
    Object.entries(scores).map(([key, value]) => [key, clampPercent(value)]),
  ) as Partial<Record<RubricKey, number | null>>;
}
