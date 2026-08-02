import { z } from "zod";

import {
  ENVIRONMENT_METRICS,
  OCCASION_METRICS,
  PERFORMANCE_METRICS,
  PERFUME_PERCENT_FIELDS,
  SEASON_METRICS,
  TIME_METRICS,
} from "@/features/perfumes/constants";

const sourceIdsSchema = z.array(z.string().trim().min(1)).min(1);

function candidateSchema<T extends z.ZodType>(value: T) {
  return z
    .object({
      value,
      sourceIds: sourceIdsSchema,
      inferred: z.boolean(),
    })
    .strict();
}

const stringCandidate = candidateSchema(z.string().trim().min(1));
const metricValue = z.number().nullable();
const metricShape = Object.fromEntries(
  [
    ...PERFORMANCE_METRICS,
    ...PERFUME_PERCENT_FIELDS,
    ...SEASON_METRICS,
    ...OCCASION_METRICS,
    ...TIME_METRICS,
    ...ENVIRONMENT_METRICS,
  ].map((key) => [key, metricValue]),
);

export const perfumeModelDraftSchema = z
  .object({
    fields: z
      .object({
        name: z.array(stringCandidate),
        brand: z.array(stringCandidate),
        description: z.array(stringCandidate),
        concentration: z.array(stringCandidate),
        categoryType: z.array(stringCandidate),
        audience: z.array(stringCandidate),
        launchYear: z.array(
          candidateSchema(z.union([z.string().trim().min(1), z.number()])),
        ),
        relationship: z.array(
          candidateSchema(
            z
              .object({
                kind: z.enum(["original", "dupe", "inspiration"]),
                reference: z.string().nullable(),
                referenceBrand: z.string().nullable(),
                referenceBrandSupported: z.boolean(),
                similarityOnly: z.boolean(),
              })
              .strict(),
          ),
        ),
        olfactoryFamilies: z.array(
          candidateSchema(z.array(z.string().trim().min(1))),
        ),
        pyramid: z.array(
          candidateSchema(
            z
              .object({
                top: z.array(z.string()),
                heart: z.array(z.string()),
                base: z.array(z.string()),
              })
              .strict(),
          ),
        ),
        accords: z.array(
          candidateSchema(
            z.array(
              z
                .object({
                  name: z.string(),
                  value: z.number(),
                })
                .strict(),
            ),
          ),
        ),
        metrics: z.array(
          candidateSchema(z.object(metricShape).strict()),
        ),
      })
      .strict(),
    explanation: z.string().trim().min(1).max(400).nullable(),
  })
  .strict();

export type PerfumeModelDraft = z.infer<typeof perfumeModelDraftSchema>;
