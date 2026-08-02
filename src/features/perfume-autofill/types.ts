import type {
  Audience,
  CategoryType,
  Concentration,
  InspirationKind,
} from "@/features/perfumes/types";
import type {
  ENVIRONMENT_METRICS,
  OCCASION_METRICS,
  PERFORMANCE_METRICS,
  PERFUME_PERCENT_FIELDS,
  SEASON_METRICS,
  TIME_METRICS,
} from "@/features/perfumes/constants";

export type AutofillSourceKind =
  | "official"
  | "specialized"
  | "technical"
  | "community";

export type AutofillFieldOrigin =
  | AutofillSourceKind
  | "inference"
  | "unavailable";

export interface AutofillQuery {
  name: string;
  brand?: string;
}

export interface AutofillSource {
  id: string;
  kind: AutofillSourceKind;
  title: string;
  url: string;
}

export interface WebEvidence {
  canonicalUrl: string;
  title: string;
  excerpt: string;
  sourceKind: AutofillSourceKind;
  provider: string;
  collectedAt: string;
}

export interface WebSearchWarning {
  code: "provider_failed" | "provider_timeout" | "not_found";
  message: string;
  provider?: string;
}

export interface WebSearchResult {
  evidence: WebEvidence[];
  warnings: WebSearchWarning[];
}

export interface AutofillConflict {
  value: string;
  sources: string[];
}

export interface AutofillFieldValue<T> {
  value: T | null;
  confidence: number;
  origin: AutofillFieldOrigin;
  sources: string[];
  conflicts: AutofillConflict[];
  inferred: boolean;
}

export interface AutofillWarning {
  code: string;
  message: string;
  field?: keyof AutofillFields;
}

export interface AutofillPyramid {
  top: string;
  heart: string;
  base: string;
}

type AutofillMetricKey =
  | (typeof PERFORMANCE_METRICS)[number]
  | (typeof PERFUME_PERCENT_FIELDS)[number]
  | (typeof SEASON_METRICS)[number]
  | (typeof OCCASION_METRICS)[number]
  | (typeof TIME_METRICS)[number]
  | (typeof ENVIRONMENT_METRICS)[number];

export type AutofillMetrics = Record<AutofillMetricKey, number | null>;

export interface AutofillFields {
  name: AutofillFieldValue<string>;
  brand: AutofillFieldValue<string>;
  description: AutofillFieldValue<string>;
  concentration: AutofillFieldValue<Concentration>;
  categoryType: AutofillFieldValue<CategoryType>;
  audience: AutofillFieldValue<Audience>;
  launchYear: AutofillFieldValue<number>;
  inspirationKind: AutofillFieldValue<InspirationKind>;
  inspiredBy: AutofillFieldValue<string>;
  olfactoryFamilies: AutofillFieldValue<string[]>;
  pyramid: AutofillFieldValue<AutofillPyramid>;
  accords: AutofillFieldValue<string>;
  metrics: AutofillFieldValue<AutofillMetrics>;
}

export interface AutofillResponse {
  query: AutofillQuery;
  fields: AutofillFields;
  sources: AutofillSource[];
  confidence: number;
  explanation: string | null;
  warnings: AutofillWarning[];
}
