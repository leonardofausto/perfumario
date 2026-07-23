"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import type { ActionState } from "@/lib/auth/types";
import {
  avatarSchema,
  profileSchema,
  type ProfileFields,
} from "@/lib/profile/schema";
import { createServerSupabase } from "@/lib/supabase/server";

type AvatarFields = { avatar: string };

const extensionByMime = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

function value(formData: FormData, key: string) {
  const field = formData.get(key);
  return typeof field === "string" ? field : "";
}

export async function updateProfileAction(
  _previousState: ActionState<ProfileFields>,
  formData: FormData,
): Promise<ActionState<ProfileFields>> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({ displayName: value(formData, "displayName") });

  if (!parsed.success) {
    return {
      status: "error",
      fields: { displayName: value(formData, "displayName") },
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: parsed.data.displayName })
    .eq("id", user.id);

  if (error) {
    return { status: "error", message: "Não foi possível salvar o perfil agora." };
  }

  revalidatePath("/", "layout");
  return {
    status: "success",
    message: "Perfil atualizado.",
    fields: parsed.data,
  };
}

export async function updateAvatarAction(
  _previousState: ActionState<AvatarFields>,
  formData: FormData,
): Promise<ActionState<AvatarFields>> {
  const user = await requireUser();
  const parsed = avatarSchema.safeParse(formData.get("avatar"));

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: { avatar: parsed.error.issues.map((issue) => issue.message) },
    };
  }

  const extension = extensionByMime[parsed.data.type as keyof typeof extensionByMime];
  const objectPath = `${user.id}/avatar-${randomUUID()}.${extension}`;
  const supabase = await createServerSupabase();
  const avatarBucket = supabase.storage.from("private-avatars");
  const { error: uploadError } = await avatarBucket.upload(objectPath, parsed.data, {
    cacheControl: "3600",
    contentType: parsed.data.type,
    upsert: false,
  });

  if (uploadError) {
    return { status: "error", message: "Não foi possível enviar a imagem agora." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ avatar_path: objectPath })
    .eq("id", user.id);

  if (profileError) {
    await avatarBucket.remove([objectPath]);
    return { status: "error", message: "Não foi possível atualizar o avatar agora." };
  }

  revalidatePath("/", "layout");
  return { status: "success", message: "Avatar atualizado." };
}
