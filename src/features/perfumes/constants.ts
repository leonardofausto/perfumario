export const CONCENTRATIONS = [
  "parfum",
  "eau_de_parfum",
  "eau_de_toilette",
  "eau_de_cologne",
  "body_splash",
  "perfume_oil",
  "other",
] as const;

export const BOTTLE_FORMATS = ["decant", "full_bottle"] as const;
export const INSPIRATION_KINDS = ["original", "dupe", "inspiration"] as const;
export const NOTE_LAYERS = ["top", "heart", "base"] as const;

export const PERFORMANCE_METRICS = [
  "fixacao",
  "projecao",
  "rastro",
  "versatilidade",
  "presenca",
] as const;

export const SEASON_METRICS = ["primavera", "verao", "outono", "inverno"] as const;

export const OCCASION_METRICS = [
  "trabalho",
  "casual",
  "encontro",
  "formal",
  "festa",
  "ar_livre",
] as const;

export const TIME_METRICS = ["manha", "tarde", "noite", "madrugada"] as const;

export const PERFUME_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_PERFUME_IMAGE_BYTES = 5 * 1024 * 1024;
