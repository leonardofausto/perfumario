import { z } from "zod";

import {
  BOTTLE_FORMATS,
  CONCENTRATIONS,
  ENVIRONMENT_METRICS,
  INSPIRATION_KINDS,
  MAX_PERFUME_IMAGE_BYTES,
  OCCASION_METRICS,
  PERFUME_IMAGE_MIME_TYPES,
  PERFORMANCE_METRICS,
  SEASON_METRICS,
  TIME_METRICS,
} from "./constants";
import type { PerfumeFormInput } from "./types";

const UNKNOWN_VALUE = "Não informado";
const requiredText = (message: string) => z.string().trim().min(1, message);
const unknownText = z.string().trim().transform((value) => value || UNKNOWN_VALUE);
const unknownTextList = z.array(z.string()).transform((values) => {
  const normalized = values.map((value) => value.trim()).filter(Boolean);
  return normalized.length > 0 ? normalized : [UNKNOWN_VALUE];
});
const score = z.number().int().min(0).max(100).nullable();
const optionalText = z
  .string()
  .trim()
  .transform((value) => value || null)
  .nullable();
const percent = z.number().int().min(0).max(100).nullable();

const perfumeScoreSchema = z.discriminatedUnion("category", [
  z.object({
    category: z.literal("accord"),
    metricKey: requiredText("Informe o acorde."),
    score,
  }),
  z.object({
    category: z.literal("performance"),
    metricKey: z.enum(PERFORMANCE_METRICS),
    score,
  }),
  z.object({
    category: z.literal("season"),
    metricKey: z.enum(SEASON_METRICS),
    score,
  }),
  z.object({
    category: z.literal("occasion"),
    metricKey: z.enum(OCCASION_METRICS),
    score,
  }),
  z.object({
    category: z.literal("time"),
    metricKey: z.enum(TIME_METRICS),
    score,
  }),
  z.object({
    category: z.literal("environment"),
    metricKey: z.enum(ENVIRONMENT_METRICS),
    score,
  }),
]);

export const perfumeFormSchema: z.ZodType<PerfumeFormInput> = z
  .object({
    brand: unknownText,
    name: unknownText,
    description: unknownText,
    concentration: z.enum(CONCENTRATIONS),
    bottleFormat: z.enum(BOTTLE_FORMATS),
    inspirationKind: z.enum(INSPIRATION_KINDS),
    inspiredBy: z
      .string()
      .trim()
      .transform((value) => value || null)
      .nullable(),
    olfactoryFamilies: unknownTextList,
    notes: z.object({
      top: unknownTextList,
      heart: unknownTextList,
      base: unknownTextList,
    }),
    scores: z.array(perfumeScoreSchema),
    launchYear: z.number().int().min(1800).max(2200).nullable(),
    categoryType: optionalText,
    audience: optionalText,
    intensity: percent,
    sweetness: percent,
    freshness: percent,
    elegance: percent,
    sensuality: percent,
    profileTags: z.array(requiredText("Informe a tag de perfil.")),
  })
  .superRefine((perfume, context) => {
    if (perfume.inspirationKind === "original" && perfume.inspiredBy !== null) {
      context.addIssue({
        code: "custom",
        message: "Perfumes originais não devem indicar outra fragrância.",
        path: ["inspiredBy"],
      });
    }

    if (perfume.inspirationKind !== "original" && perfume.inspiredBy === null) {
      perfume.inspiredBy = UNKNOWN_VALUE;
    }
  });

export const perfumeImageSchema = z
  .custom<File>((value) => typeof File !== "undefined" && value instanceof File, {
    message: "Selecione uma imagem.",
  })
  .refine(
    (file) => file.size <= MAX_PERFUME_IMAGE_BYTES,
    "A imagem deve ter no máximo 5 MB.",
  )
  .refine(
    (file) =>
      PERFUME_IMAGE_MIME_TYPES.includes(
        file.type as (typeof PERFUME_IMAGE_MIME_TYPES)[number],
      ),
    "Use uma imagem JPG, PNG, AVIF ou WebP.",
  );

export type PerfumeFormFields = z.input<typeof perfumeFormSchema>;
