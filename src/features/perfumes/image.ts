import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";

import { perfumeImageSchema } from "./schema";

const BUCKET = "perfume-images";
const EXTENSIONS_BY_MIME = {
  "image/avif": "avif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export async function uploadPerfumeCover(input: {
  userId: string;
  perfumeId: string;
  file: File;
}): Promise<{ imagePath: string }> {
  const parsed = perfumeImageSchema.safeParse(input.file);

  if (!parsed.success) {
    throw new Error("Imagem inválida. Use JPG, PNG, AVIF ou WebP.");
  }

  const extension = EXTENSIONS_BY_MIME[parsed.data.type as keyof typeof EXTENSIONS_BY_MIME];
  const imagePath = `${input.userId}/${input.perfumeId}/cover.${extension}`;
  const supabase = await createServerSupabase();
  const { error } = await supabase.storage.from(BUCKET).upload(imagePath, parsed.data, {
    cacheControl: "3600",
    contentType: parsed.data.type,
    upsert: true,
  });

  if (error) {
    throw new Error("Não foi possível enviar a imagem do perfume.");
  }

  return { imagePath };
}

export async function removePerfumeImages(input: {
  userId: string;
  perfumeId: string;
}): Promise<void> {
  const prefix = `${input.userId}/${input.perfumeId}`;
  const supabase = await createServerSupabase();
  const bucket = supabase.storage.from(BUCKET);
  const { data, error } = await bucket.list(prefix);

  if (error) {
    throw new Error("Não foi possível localizar as imagens do perfume.");
  }

  const paths = (data ?? []).map(({ name }) => `${prefix}/${name}`);
  if (paths.length === 0) return;

  const { error: removeError } = await bucket.remove(paths);
  if (removeError) {
    throw new Error("Não foi possível remover as imagens do perfume.");
  }
}
