import type {
  BOTTLE_FORMATS,
  CONCENTRATIONS,
  INSPIRATION_KINDS,
  NOTE_LAYERS,
  PERFUME_PERCENT_FIELDS,
} from "./constants";

export type NoteLayer = (typeof NOTE_LAYERS)[number];
export type ScoreCategory =
  | "accord"
  | "performance"
  | "season"
  | "occasion"
  | "time"
  | "environment";
export type InspirationKind = (typeof INSPIRATION_KINDS)[number];
export type BottleFormat = (typeof BOTTLE_FORMATS)[number];
export type Concentration = (typeof CONCENTRATIONS)[number];
export type PerfumePercentField = (typeof PERFUME_PERCENT_FIELDS)[number];
export type CategoryType =
  (typeof import("./constants").CATEGORY_TYPE_OPTIONS)[number]["value"];
export type Audience =
  (typeof import("./constants").AUDIENCE_OPTIONS)[number]["value"];

export interface PerfumeScore {
  category: ScoreCategory;
  metricKey: string;
  score: number | null;
}

export interface PerfumeFormInput {
  brand: string;
  name: string;
  description: string;
  concentration: Concentration;
  bottleFormat: BottleFormat;
  inspirationKind: InspirationKind;
  inspiredBy: string | null;
  olfactoryFamilies: string[];
  notes: Record<NoteLayer, string[]>;
  scores: PerfumeScore[];
  launchYear: number | null;
  categoryType: string | null;
  audience: string | null;
  intensity: number | null;
  sweetness: number | null;
  freshness: number | null;
  elegance: number | null;
  sensuality: number | null;
  profileTags: string[];
}

export interface PerfumeSummary {
  id: string;
  brand: string;
  name: string;
  concentration: Concentration;
  bottleFormat: BottleFormat;
  inspirationKind: InspirationKind;
  inspiredBy: string | null;
  olfactoryFamilies: string[];
  imageUrl: string | null;
  isFavorite: boolean;
  launchYear: number | null;
  categoryType: string | null;
  audience: string | null;
  intensity: number | null;
  sweetness: number | null;
  freshness: number | null;
  elegance: number | null;
  sensuality: number | null;
  profileTags: string[];
}

export interface PerfumeDetail extends PerfumeSummary {
  description: string;
  imagePath: string | null;
  imageSourceUrl: string | null;
  descriptionSourceUrls: string[];
  notes: Record<NoteLayer, string[]>;
  scores: PerfumeScore[];
  createdAt: string;
  updatedAt: string;
}
