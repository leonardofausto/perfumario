"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionState } from "@/lib/auth/types";

import { usageInputSchema } from "./schema";
import {
  createOwnUsage,
  deleteOwnUsage,
  updateOwnUsage,
} from "./repository";

export type UsageActionFields = {
  perfumeId: string;
  usedAt: string;
  occasionKey: string;
  timeKey: string;
  environmentKey: string;
  complimentsCount: string;
  satisfaction: string;
  performanceRating: string;
  weatherSource: string;
  temperature: string;
  feelsLike: string;
  weatherCondition: string;
  seasonKey: string;
  city: string;
  notes: string;
};

const fieldNames = [
  "perfumeId",
  "usedAt",
  "occasionKey",
  "timeKey",
  "environmentKey",
  "complimentsCount",
  "satisfaction",
  "performanceRating",
  "weatherSource",
  "temperature",
  "feelsLike",
  "weatherCondition",
  "seasonKey",
  "city",
  "notes",
] as const satisfies readonly (keyof UsageActionFields)[];

function fieldsFrom(formData: FormData): UsageActionFields {
  return Object.fromEntries(
    fieldNames.map((name) => {
      const value = formData.get(name);
      return [name, typeof value === "string" ? value : ""];
    }),
  ) as UsageActionFields;
}

function optionalNumber(value: string) {
  return value.trim() === "" ? null : Number(value);
}

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function parseUsage(formData: FormData) {
  const fields = fieldsFrom(formData);
  const localDate = new Date(fields.usedAt);
  const parsed = usageInputSchema.safeParse({
    perfumeId: fields.perfumeId,
    usedAt: Number.isNaN(localDate.getTime()) ? fields.usedAt : localDate.toISOString(),
    occasionKey: fields.occasionKey,
    timeKey: fields.timeKey,
    environmentKey: fields.environmentKey,
    complimentsCount: Number(fields.complimentsCount),
    satisfaction: Number(fields.satisfaction),
    performanceRating: optionalNumber(fields.performanceRating),
    weatherSource: optionalText(fields.weatherSource),
    temperature: optionalNumber(fields.temperature),
    feelsLike: optionalNumber(fields.feelsLike),
    weatherCondition: optionalText(fields.weatherCondition),
    seasonKey: optionalText(fields.seasonKey),
    city: optionalText(fields.city),
    notes: optionalText(fields.notes),
  });

  return { fields, parsed };
}

function validationError(
  fields: UsageActionFields,
  error: z.ZodError,
): ActionState<UsageActionFields> {
  return {
    status: "error",
    fields,
    fieldErrors: error.flatten().fieldErrors as Partial<
      Record<keyof UsageActionFields, string[]>
    >,
  };
}

export async function createUsageAction(
  _previousState: ActionState<UsageActionFields>,
  formData: FormData,
): Promise<ActionState<UsageActionFields>> {
  const { fields, parsed } = parseUsage(formData);
  if (!parsed.success) return validationError(fields, parsed.error);

  try {
    await createOwnUsage(parsed.data);
    revalidatePath("/diario");
    return { status: "success", message: "Uso registrado." };
  } catch {
    return {
      status: "error",
      fields,
      message: "Não foi possível registrar este uso.",
    };
  }
}

export async function updateUsageAction(
  id: string,
  _previousState: ActionState<UsageActionFields>,
  formData: FormData,
): Promise<ActionState<UsageActionFields>> {
  const { fields, parsed } = parseUsage(formData);
  if (!parsed.success) return validationError(fields, parsed.error);

  try {
    await updateOwnUsage(id, parsed.data);
    revalidatePath("/diario");
    return { status: "success", message: "Uso atualizado." };
  } catch {
    return {
      status: "error",
      fields,
      message: "Não foi possível atualizar este uso.",
    };
  }
}

export async function deleteUsageAction(id: string) {
  try {
    const deleted = await deleteOwnUsage(id);
    if (!deleted) {
      return { status: "error" as const, message: "Registro não encontrado." };
    }
    revalidatePath("/diario");
    return { status: "success" as const };
  } catch {
    return {
      status: "error" as const,
      message: "Não foi possível excluir este uso.",
    };
  }
}
