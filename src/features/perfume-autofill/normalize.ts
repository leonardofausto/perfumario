import {
  AUDIENCE_OPTIONS,
  CATEGORY_TYPE_OPTIONS,
  CONCENTRATIONS,
} from "@/features/perfumes/constants";
import type {
  Audience,
  CategoryType,
  Concentration,
  InspirationKind,
} from "@/features/perfumes/types";

import type { AutofillPyramid } from "./types";

function compact(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function fold(value: string) {
  return compact(value)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR");
}

function capitalize(value: string) {
  return value
    .toLocaleLowerCase("pt-BR")
    .replace(/(^|[\s-])(\p{L})/gu, (_, boundary: string, letter: string) =>
      `${boundary}${letter.toLocaleUpperCase("pt-BR")}`,
    );
}

export function normalizeName(value: string) {
  const normalized = compact(value);
  if (!normalized) return "";

  const letters = normalized.replace(/[^\p{L}]/gu, "");
  return letters &&
    (letters === letters.toLocaleUpperCase("pt-BR") ||
      letters === letters.toLocaleLowerCase("pt-BR")) &&
    letters.length > 1
    ? capitalize(normalized)
    : normalized;
}

const concentrationAliases: Record<string, Concentration> = {
  desconhecida: "unknown",
  "concentracao desconhecida": "unknown",
  unknown: "unknown",
  "body splash": "body_splash",
  "eau de cologne": "eau_de_cologne",
  edc: "eau_de_cologne",
  "eau de parfum": "eau_de_parfum",
  edp: "eau_de_parfum",
  "eau de toilette": "eau_de_toilette",
  edt: "eau_de_toilette",
  "oleo de perfume": "perfume_oil",
  "perfume oil": "perfume_oil",
  parfum: "parfum",
  perfume: "parfum",
};

export function normalizeConcentration(value: string): Concentration {
  const normalized = fold(value).replace(/_/g, " ");
  const direct = concentrationAliases[normalized];
  if (direct) return direct;

  const enumValue = normalized.replace(/\s+/g, "_");
  return CONCENTRATIONS.includes(enumValue as Concentration)
    ? (enumValue as Concentration)
    : "unknown";
}

function optionMap<T extends string>(
  options: readonly { value: T; label: string }[],
) {
  return new Map(
    options.flatMap(({ value, label }) => [
      [fold(value), value] as const,
      [fold(label), value] as const,
    ]),
  );
}

const categoryTypes = optionMap(CATEGORY_TYPE_OPTIONS);
const audiences = new Map<ReturnType<typeof fold>, Audience>([
  ...optionMap(AUDIENCE_OPTIONS),
  ["compartilhavel", "unisex"],
]);

export function normalizeCategoryType(value: string): CategoryType | null {
  return categoryTypes.get(fold(value)) ?? null;
}

export function normalizeAudience(value: string): Audience | null {
  return audiences.get(fold(value)) ?? null;
}

export function normalizeYear(value: string | number | null | undefined) {
  const normalized =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\s*\d{4}\s*$/.test(value)
        ? Number(value)
        : Number.NaN;

  return Number.isInteger(normalized) && normalized >= 1800 && normalized <= 2200
    ? normalized
    : null;
}

function uniqueValues(values: readonly string[]) {
  const seen = new Set<string>();
  return values.reduce<string[]>((result, value) => {
    const normalized = normalizeName(value);
    const key = fold(normalized);
    if (!normalized || seen.has(key)) return result;
    seen.add(key);
    result.push(normalized);
    return result;
  }, []);
}

export function normalizePyramid(layers: {
  top: readonly string[];
  heart: readonly string[];
  base: readonly string[];
}): AutofillPyramid {
  return {
    top: uniqueValues(layers.top).join(" - "),
    heart: uniqueValues(layers.heart).join(" - "),
    base: uniqueValues(layers.base).join(" - "),
  };
}

export function clampPercent(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(100, Math.max(0, Math.round(value)))
    : null;
}

export function normalizeAccords(
  accords: readonly { name: string; value: number }[],
) {
  const deduplicated = new Map<
    string,
    { name: string; value: number }
  >();

  for (const accord of accords) {
    const name = normalizeName(accord.name);
    const value = clampPercent(accord.value);
    if (!name || value === null) continue;

    const key = fold(name);
    const current = deduplicated.get(key);
    if (!current || value > current.value) {
      deduplicated.set(key, { name, value });
    }
  }

  return [...deduplicated.values()]
    .sort(
      (left, right) =>
        right.value - left.value ||
        left.name.localeCompare(right.name, "pt-BR"),
    )
    .map(({ name, value }) => `${name}: ${value}`)
    .join("\n");
}

const referencePrefix =
  /^(?:(?:inspirad[oa]|inspiration|inspired|dupe|similar)\s+(?:em|by|to)|inspirad[oa]\s+na\s+fragr[aâ]ncia)(?:\s+|$)/i;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function normalizeRelationship(input: {
  kind: InspirationKind;
  reference?: string | null;
  referenceBrand?: string | null;
  referenceBrandSupported?: boolean;
  similarityOnly?: boolean;
}) {
  if (input.kind === "original" || input.similarityOnly) {
    return {
      inspirationKind: "original" as const,
      inspiredBy: null,
    };
  }

  let reference = compact(input.reference ?? "").replace(referencePrefix, "");

  if (input.referenceBrandSupported && input.referenceBrand) {
    const brand = compact(input.referenceBrand);
    reference = reference.replace(
      new RegExp(`^${escapeRegExp(brand)}(?:\\s+|\\s*[-:–—]\\s*)`, "i"),
      "",
    );
  }

  reference = normalizeName(reference);
  if (!reference) {
    throw new Error("Referência obrigatória para Inspiração ou Dupe.");
  }

  return {
    inspirationKind: input.kind,
    inspiredBy: reference,
  };
}
