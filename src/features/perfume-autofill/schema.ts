import { z } from "zod";

import {
  AUDIENCE_OPTIONS,
  CATEGORY_TYPE_OPTIONS,
  CONCENTRATIONS,
  ENVIRONMENT_METRICS,
  INSPIRATION_KINDS,
  OCCASION_METRICS,
  PERFORMANCE_METRICS,
  PERFUME_PERCENT_FIELDS,
  SEASON_METRICS,
  TIME_METRICS,
} from "@/features/perfumes/constants";

const sourceKindSchema = z.enum([
  "official",
  "specialized",
  "technical",
  "community",
]);
const fieldOriginSchema = z.enum([
  ...sourceKindSchema.options,
  "inference",
  "unavailable",
]);
const categoryTypeSchema = z.enum(
  CATEGORY_TYPE_OPTIONS.map(({ value }) => value),
);
const audienceSchema = z.enum(AUDIENCE_OPTIONS.map(({ value }) => value));
const nullableScoreSchema = z.number().int().min(0).max(100).nullable();

function scoreShape(keys: readonly string[]) {
  return Object.fromEntries(keys.map((key) => [key, nullableScoreSchema]));
}

const metricsSchema = z
  .object({
    ...scoreShape(PERFORMANCE_METRICS),
    ...scoreShape(PERFUME_PERCENT_FIELDS),
    ...scoreShape(SEASON_METRICS),
    ...scoreShape(OCCASION_METRICS),
    ...scoreShape(TIME_METRICS),
    ...scoreShape(ENVIRONMENT_METRICS),
  })
  .strict();

const conflictSchema = z
  .object({
    value: z.string().trim().min(1),
    sources: z.array(z.string().trim().min(1)).min(1),
  })
  .strict();

function fieldValueSchema<T extends z.ZodType>(valueSchema: T) {
  return z
    .object({
      value: valueSchema.nullable(),
      confidence: z.number().min(0).max(1),
      origin: fieldOriginSchema,
      sources: z.array(z.string().trim().min(1)),
      conflicts: z.array(conflictSchema),
      inferred: z.boolean(),
    })
    .strict();
}

export const autofillQuerySchema = z
  .object({
    name: z.string().trim().min(1),
    brand: z.string().trim().min(1).optional(),
  })
  .strict();

export const autofillRequestSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    brand: z.string().trim().min(1).max(120).optional(),
    ignoreCache: z.boolean().optional().default(false),
  })
  .strict();

export const autofillSourceSchema = z
  .object({
    id: z.string().trim().min(1),
    kind: sourceKindSchema,
    title: z.string().trim().min(1),
    url: z.url(),
  })
  .strict();

const fieldsSchema = z
  .object({
    name: fieldValueSchema(z.string().trim().min(1)),
    brand: fieldValueSchema(z.string().trim().min(1)),
    description: fieldValueSchema(z.string().trim().min(1)),
    concentration: fieldValueSchema(z.enum(CONCENTRATIONS)),
    categoryType: fieldValueSchema(categoryTypeSchema),
    audience: fieldValueSchema(audienceSchema),
    launchYear: fieldValueSchema(z.number().int().min(1800).max(2200)),
    inspirationKind: fieldValueSchema(z.enum(INSPIRATION_KINDS)),
    inspiredBy: fieldValueSchema(z.string().trim().min(1)),
    olfactoryFamilies: fieldValueSchema(
      z.array(z.string().trim().min(1)),
    ),
    pyramid: fieldValueSchema(
      z
        .object({
          top: z.string(),
          heart: z.string(),
          base: z.string(),
        })
        .strict(),
    ),
    accords: fieldValueSchema(z.string()),
    metrics: fieldValueSchema(metricsSchema),
  })
  .strict();

export const autofillResponseSchema = z
  .object({
    query: autofillQuerySchema,
    fields: fieldsSchema,
    sources: z.array(autofillSourceSchema),
    confidence: z.number().min(0).max(1),
    explanation: z.string().trim().min(1).max(400).nullable(),
    warnings: z.array(
      z
        .object({
          code: z.string().trim().min(1),
          message: z.string().trim().min(1),
          field: z
            .enum([
              "name",
              "brand",
              "description",
              "concentration",
              "categoryType",
              "audience",
              "launchYear",
              "inspirationKind",
              "inspiredBy",
              "olfactoryFamilies",
              "pyramid",
              "accords",
              "metrics",
            ])
            .optional(),
        })
        .strict(),
    ),
  })
  .strict()
  .superRefine(({ fields }, context) => {
    if (
      fields.inspirationKind.value === "original" &&
      fields.inspiredBy.value !== null
    ) {
      context.addIssue({
        code: "custom",
        message: "Perfume original não pode ter referência.",
        path: ["fields", "inspiredBy", "value"],
      });
    }

    if (
      fields.inspirationKind.value !== null &&
      fields.inspirationKind.value !== "original" &&
      fields.inspiredBy.value === null
    ) {
      context.addIssue({
        code: "custom",
        message: "Inspiração e Dupe exigem referência.",
        path: ["fields", "inspiredBy", "value"],
      });
    }
  });
