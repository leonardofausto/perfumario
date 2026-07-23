import { z } from "zod";

export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
export const AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Informe como deseja ser chamado.")
    .max(80, "Use no máximo 80 caracteres."),
});

export const avatarSchema = z
  .custom<File>((value) => typeof File !== "undefined" && value instanceof File, {
    message: "Selecione uma imagem.",
  })
  .refine((file) => file.size <= MAX_AVATAR_BYTES, "A imagem deve ter no máximo 5 MB.")
  .refine(
    (file) => AVATAR_MIME_TYPES.includes(file.type as (typeof AVATAR_MIME_TYPES)[number]),
    "Use uma imagem JPEG, PNG ou WebP.",
  );

export type ProfileFields = z.infer<typeof profileSchema>;
