"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import type { ActionState } from "@/lib/auth/types";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  canSetReplenishmentIntent,
  containerStatusSchema,
} from "@/features/experience/container-status";
import type { ReplenishmentIntent } from "@/features/experience/types";

import { removePerfumeImages, uploadPerfumeCover } from "./image";
import { perfumeFormSchema } from "./schema";
import type { PerfumeFormInput } from "./types";

export type PerfumeActionFields = {
  brand: string;
  name: string;
  description: string;
  concentration: string;
  bottleFormat: string;
  inspirationKind: string;
  inspiredBy: string;
  olfactoryFamilies: string;
  notes: string;
  scores: string;
  launchYear: string;
  categoryType: string;
  audience: string;
  intensity: string;
  sweetness: string;
  freshness: string;
  elegance: string;
  sensuality: string;
  profileTags: string;
};

function text(formData: FormData, key: keyof PerfumeActionFields) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function json(value: string, fallback: unknown) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function nullableInteger(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : Number(trimmed);
}

function fieldsFrom(formData: FormData): PerfumeActionFields {
  return {
    brand: text(formData, "brand"),
    name: text(formData, "name"),
    description: text(formData, "description"),
    concentration: text(formData, "concentration"),
    bottleFormat: text(formData, "bottleFormat"),
    inspirationKind: text(formData, "inspirationKind"),
    inspiredBy: text(formData, "inspiredBy"),
    olfactoryFamilies: text(formData, "olfactoryFamilies"),
    notes: text(formData, "notes"),
    scores: text(formData, "scores"),
    launchYear: text(formData, "launchYear"),
    categoryType: text(formData, "categoryType"),
    audience: text(formData, "audience"),
    intensity: text(formData, "intensity"),
    sweetness: text(formData, "sweetness"),
    freshness: text(formData, "freshness"),
    elegance: text(formData, "elegance"),
    sensuality: text(formData, "sensuality"),
    profileTags: text(formData, "profileTags"),
  };
}

function parseForm(formData: FormData) {
  const fields = fieldsFrom(formData);
  const parsed = perfumeFormSchema.safeParse({
    ...fields,
    inspiredBy: fields.inspiredBy,
    olfactoryFamilies: json(fields.olfactoryFamilies, []),
    notes: json(fields.notes, {}),
    scores: json(fields.scores, []),
    launchYear: nullableInteger(fields.launchYear),
    categoryType: fields.categoryType,
    audience: fields.audience,
    intensity: nullableInteger(fields.intensity),
    sweetness: nullableInteger(fields.sweetness),
    freshness: nullableInteger(fields.freshness),
    elegance: nullableInteger(fields.elegance),
    sensuality: nullableInteger(fields.sensuality),
    profileTags: json(fields.profileTags, []),
  });

  return { fields, parsed };
}

function rpcPayload(userId: string, perfume: PerfumeFormInput) {
  return {
    p_user_id: userId,
    p_brand: perfume.brand,
    p_name: perfume.name,
    p_description: perfume.description,
    p_concentration: perfume.concentration,
    p_bottle_format: perfume.bottleFormat,
    p_inspiration_kind: perfume.inspirationKind,
    p_inspired_by: perfume.inspiredBy,
    p_olfactory_families: perfume.olfactoryFamilies,
    p_launch_year: perfume.launchYear,
    p_category_type: perfume.categoryType,
    p_audience: perfume.audience,
    p_intensity: perfume.intensity,
    p_sweetness: perfume.sweetness,
    p_freshness: perfume.freshness,
    p_elegance: perfume.elegance,
    p_sensuality: perfume.sensuality,
    p_profile_tags: perfume.profileTags,
    p_notes: Object.entries(perfume.notes).flatMap(([layer, notes]) =>
      notes.map((note, displayOrder) => ({
        layer,
        note,
        display_order: displayOrder,
      })),
    ),
    p_scores: perfume.scores.map((score) => ({
      category: score.category,
      metric_key: score.metricKey,
      score: score.score,
    })),
  };
}

function validationError(
  fields: PerfumeActionFields,
  error: ReturnType<typeof perfumeFormSchema.safeParse> & { success: false },
): ActionState<PerfumeActionFields> {
  return {
    status: "error",
    fields,
    fieldErrors: error.error.flatten().fieldErrors as Partial<
      Record<keyof PerfumeActionFields, string[]>
    >,
  };
}

function revalidatePerfumePaths(id: string) {
  revalidatePath("/colecao");
  revalidatePath(`/colecao/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/recomendador");
}

export type ContainerStatusActionFields = {
  level: string;
  replenishmentIntent: string;
};

export async function updateContainerStatusAction(
  id: string,
  _previousState: ActionState<ContainerStatusActionFields>,
  formData: FormData,
): Promise<ActionState<ContainerStatusActionFields>> {
  const user = await requireUser();
  const fields = {
    level: typeof formData.get("level") === "string" ? String(formData.get("level")) : "",
    replenishmentIntent:
      typeof formData.get("replenishmentIntent") === "string"
        ? String(formData.get("replenishmentIntent"))
        : "",
  };
  const supabase = await createServerSupabase();
  const { data: current, error: lookupError } = await supabase
    .from("perfumes")
    .select("bottle_format, replenishment_intent")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (lookupError || !current) {
    return { status: "error", fields, message: "Perfume não encontrado." };
  }

  const parsed = containerStatusSchema.safeParse({
    bottleFormat: current.bottle_format,
    level: fields.level,
    replenishmentIntent: fields.replenishmentIntent || null,
  });
  const currentIntent = current.replenishment_intent as ReplenishmentIntent | null;

  if (
    !parsed.success ||
    !canSetReplenishmentIntent(
      parsed.data.level,
      parsed.data.replenishmentIntent,
      currentIntent,
    )
  ) {
    return {
      status: "error",
      fields,
      message: "Revise o nível e a intenção de reposição.",
    };
  }

  const { data, error } = await supabase
    .from("perfumes")
    .update({
      container_level: parsed.data.level,
      container_level_updated_at: new Date().toISOString(),
      replenishment_intent: parsed.data.replenishmentIntent,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      status: "error",
      fields,
      message: "Não foi possível atualizar o acompanhamento.",
    };
  }

  revalidatePerfumePaths(id);
  return { status: "success", fields };
}

async function attachImage(
  userId: string,
  perfumeId: string,
  formData: FormData,
) {
  const cover = formData.get("image");
  if (!(cover instanceof File) || cover.size === 0) return;

  const { imagePath } = await uploadPerfumeCover({
    userId,
    perfumeId,
    file: cover,
  });
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("perfumes")
    .update({ image_path: imagePath })
    .eq("id", perfumeId)
    .eq("user_id", userId);

  if (error) {
    await removePerfumeImages({ userId, perfumeId });
    throw new Error("Não foi possível vincular a imagem ao perfume.");
  }
}

export async function createPerfumeAction(
  _previousState: ActionState<PerfumeActionFields>,
  formData: FormData,
): Promise<ActionState<PerfumeActionFields>> {
  const user = await requireUser();
  const { fields, parsed } = parseForm(formData);

  if (!parsed.success) {
    return validationError(fields, parsed);
  }

  const supabase = await createServerSupabase();
  const { data: perfumeId, error } = await supabase.rpc(
    "create_perfume",
    rpcPayload(user.id, parsed.data),
  );

  if (error || typeof perfumeId !== "string") {
    return { status: "error", fields, message: "Não foi possível adicionar o perfume." };
  }

  try {
    await attachImage(user.id, perfumeId, formData);
  } catch (imageError) {
    await supabase.from("perfumes").delete().eq("id", perfumeId).eq("user_id", user.id);
    return {
      status: "error",
      fields,
      message:
        imageError instanceof Error ? imageError.message : "Não foi possível salvar a imagem.",
    };
  }

  revalidatePerfumePaths(perfumeId);
  redirect(`/colecao/${perfumeId}`);
  return { status: "success", fields };
}

export async function updatePerfumeAction(
  id: string,
  _previousState: ActionState<PerfumeActionFields>,
  formData: FormData,
): Promise<ActionState<PerfumeActionFields>> {
  const user = await requireUser();
  const { fields, parsed } = parseForm(formData);

  if (!parsed.success) {
    return validationError(fields, parsed);
  }

  const supabase = await createServerSupabase();
  const { data: updated, error } = await supabase.rpc("update_perfume", {
    p_id: id,
    ...rpcPayload(user.id, parsed.data),
  });

  if (error || updated !== true) {
    return { status: "error", fields, message: "Não foi possível atualizar o perfume." };
  }

  try {
    await attachImage(user.id, id, formData);
  } catch (imageError) {
    return {
      status: "error",
      fields,
      message:
        imageError instanceof Error ? imageError.message : "Não foi possível salvar a imagem.",
    };
  }

  revalidatePerfumePaths(id);
  redirect(`/colecao/${id}`);
  return { status: "success", fields };
}

export async function toggleFavoriteAction(
  id: string,
  next: boolean,
): Promise<{ status: "success" | "error"; message?: string }> {
  const user = await requireUser();
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("perfumes")
    .update({ is_favorite: next })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { status: "error", message: "Não foi possível atualizar o favorito." };
  }

  revalidatePerfumePaths(id);
  return { status: "success" };
}

export async function deletePerfumeAction(
  id: string,
): Promise<{ status: "success" | "error"; message?: string }> {
  const user = await requireUser();
  const supabase = await createServerSupabase();
  const { data, error: lookupError } = await supabase
    .from("perfumes")
    .select("image_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (lookupError || !data) {
    return { status: "error", message: "Perfume não encontrado." };
  }

  const { error } = await supabase
    .from("perfumes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { status: "error", message: "Não foi possível excluir o perfume." };
  }

  if (data.image_path) {
    try {
      await removePerfumeImages({ userId: user.id, perfumeId: id });
    } catch {
      // The database remains authoritative; orphan cleanup can be retried safely.
    }
  }

  revalidatePerfumePaths(id);
  redirect("/colecao");
  return { status: "success" };
}
