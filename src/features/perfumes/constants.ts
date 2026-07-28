export const CONCENTRATIONS = [
  "unknown",
  "body_splash",
  "eau_de_cologne",
  "eau_de_parfum",
  "eau_de_toilette",
  "perfume_oil",
  "parfum",
] as const;

export const BOTTLE_FORMATS = ["decant", "full_bottle"] as const;
export const INSPIRATION_KINDS = ["original", "dupe", "inspiration"] as const;
export const NOTE_LAYERS = ["top", "heart", "base"] as const;
export const PERCENT_MIN = 0;
export const PERCENT_MAX = 100;
export const PERFUME_PERCENT_FIELDS = [
  "intensity",
  "sweetness",
  "freshness",
  "elegance",
  "sensuality",
] as const;

export const CATEGORY_TYPE_OPTIONS = [
  { value: "arabe", label: "Árabe" },
  { value: "designer", label: "Designer" },
  { value: "importado", label: "Importado" },
  { value: "nacional", label: "Nacional" },
  { value: "niche", label: "Nicho" },
] as const;

export const AUDIENCE_OPTIONS = [
  { value: "feminine", label: "Feminino" },
  { value: "masculine", label: "Masculino" },
  { value: "unisex", label: "Unissex" },
] as const;

export const RELATION_OPTIONS = [
  { value: "original", label: "Original" },
  { value: "inspiration", label: "Inspiração" },
  { value: "dupe", label: "Dupe" },
] as const;

export function formatOptionalText(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? "Não informado" : String(value);
}

export function formatPercent(value: number | null | undefined) {
  return value === null || value === undefined ? "Não informado" : `${value}%`;
}

export function validatePercent(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numberValue = typeof value === "number" ? value : Number(value);

  return Number.isInteger(numberValue) &&
    numberValue >= PERCENT_MIN &&
    numberValue <= PERCENT_MAX
    ? null
    : `Informe um valor de ${PERCENT_MIN} a ${PERCENT_MAX}.`;
}

export const PERFORMANCE_METRICS = [
  "fixacao",
  "projecao",
  "rastro",
  "versatilidade",
  "presenca",
] as const;

export const SEASON_METRICS = ["primavera", "verao", "outono", "inverno"] as const;

export const OCCASION_METRICS = [
  "ar_livre",
  "casual",
  "encontro",
  "festa",
  "formal",
  "trabalho",
] as const;

export const TIME_METRICS = ["manha", "tarde", "noite", "madrugada"] as const;

export const ENVIRONMENT_METRICS = [
  "ar_livre",
  "fechado",
] as const;

export const PERFUME_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/avif",
  "image/webp",
] as const;
export const MAX_PERFUME_IMAGE_BYTES = 5 * 1024 * 1024;
