import type {
  BOTTLE_FORMATS,
  CONCENTRATIONS,
  INSPIRATION_KINDS,
  NOTE_LAYERS,
} from "./constants";

export type NoteLayer = (typeof NOTE_LAYERS)[number];
export type ScoreCategory = "performance" | "season" | "occasion" | "time";
export type InspirationKind = (typeof INSPIRATION_KINDS)[number];
export type BottleFormat = (typeof BOTTLE_FORMATS)[number];
export type Concentration = (typeof CONCENTRATIONS)[number];

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
