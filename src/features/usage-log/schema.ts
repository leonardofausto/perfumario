import { z } from "zod";

import {
  USAGE_ENVIRONMENTS,
  USAGE_OCCASIONS,
  USAGE_SEASONS,
  USAGE_TIMES,
  WEATHER_SOURCES,
} from "./types";

const optionalText = z
  .string()
  .trim()
  .max(500)
  .nullable()
  .transform((value) => value || null);

const weatherText = z
  .string()
  .trim()
  .max(120)
  .nullable()
  .transform((value) => value || null);

export const usageInputSchema = z
  .object({
    perfumeId: z.uuid(),
    usedAt: z.iso.datetime(),
    occasionKey: z.enum(USAGE_OCCASIONS),
    timeKey: z.enum(USAGE_TIMES),
    environmentKey: z.enum(USAGE_ENVIRONMENTS),
    complimentsCount: z.int().min(0),
    satisfaction: z.int().min(1).max(5),
    performanceRating: z.int().min(1).max(5).nullable(),
    weatherSource: z.enum(WEATHER_SOURCES).nullable(),
    temperature: z.number().min(-100).max(100).nullable(),
    feelsLike: z.number().min(-100).max(100).nullable(),
    weatherCondition: weatherText,
    seasonKey: z.enum(USAGE_SEASONS).nullable(),
    city: weatherText,
    notes: optionalText,
  })
  .superRefine((usage, context) => {
    if (new Date(usage.usedAt).getTime() > Date.now()) {
      context.addIssue({
        code: "custom",
        path: ["usedAt"],
        message: "A data de uso não pode estar no futuro.",
      });
    }

    const hasWeatherDetails =
      usage.temperature !== null ||
      usage.feelsLike !== null ||
      usage.weatherCondition !== null ||
      usage.seasonKey !== null ||
      usage.city !== null;

    if (usage.weatherSource === null && hasWeatherDetails) {
      context.addIssue({
        code: "custom",
        path: ["weatherSource"],
        message: "Informe a origem antes de registrar dados climáticos.",
      });
    }
  });

export const usageIdSchema = z.uuid();

export const usagePeriodSchema = z
  .object({
    from: z.iso.datetime(),
    to: z.iso.datetime(),
  })
  .refine(({ from, to }) => new Date(from) < new Date(to), {
    path: ["to"],
    message: "O fim do período deve ser posterior ao início.",
  });

export const usageCursorSchema = z.object({
  usedAt: z.iso.datetime(),
  id: z.uuid(),
});

export const usagePageSizeSchema = z.int().min(1).max(100);
