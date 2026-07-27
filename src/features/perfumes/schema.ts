import { z } from "zod";

import {
  BOTTLE_FORMATS,
  CONCENTRATIONS,
  INSPIRATION_KINDS,
  MAX_PERFUME_IMAGE_BYTES,
  OCCASION_METRICS,
  PERFUME_IMAGE_MIME_TYPES,
  PERFORMANCE_METRICS,
  SEASON_METRICS,
  TIME_METRICS,
} from "./constants";
import type { PerfumeFormInput } from "./types";

const requiredText = (message: string) => z.string().trim().min(1, message);
const noteList = z.array(requiredText("Informe a nota olfativa.")).min(1);
const score = z.number().int().min(0).max(100).nullable();

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
]);

export const perfumeFormSchema: z.ZodType<PerfumeFormInput> = z
  .object({
    brand: requiredText("Informe a marca."),
    name: requiredText("Informe o nome do perfume."),
    description: requiredText("Descreva a fragrância."),
    concentration: z.enum(CONCENTRATIONS),
    bottleFormat: z.enum(BOTTLE_FORMATS),
    inspirationKind: z.enum(INSPIRATION_KINDS),
    inspiredBy: z
      .string()
      .trim()
      .transform((value) => value || null)
      .nullable(),
    olfactoryFamilies: z
      .array(requiredText("Informe a família olfativa."))
      .min(1, "Informe pelo menos uma família olfativa."),
    notes: z.object({
      top: noteList,
      heart: noteList,
      base: noteList,
    }),
    scores: z.array(perfumeScoreSchema),
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
      context.addIssue({
        code: "custom",
        message: "Informe qual perfume serviu de referência.",
        path: ["inspiredBy"],
      });
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
    "Use uma imagem JPEG, PNG ou WebP.",
  );

export type PerfumeFormFields = z.input<typeof perfumeFormSchema>;
