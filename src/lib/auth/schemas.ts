import { z } from "zod";

const email = z
  .string()
  .trim()
  .min(1, "Informe seu e-mail.")
  .email("Informe um e-mail válido.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Informe sua senha."),
});

export const passwordResetRequestSchema = z.object({ email });

export const passwordResetSchema = z
  .object({
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
    confirmPassword: z.string().min(1, "Confirme a nova senha."),
  })
  .refine(({ confirmPassword, password }) => confirmPassword === password, {
    message: "As senhas precisam ser iguais.",
    path: ["confirmPassword"],
  });

export type LoginFields = z.infer<typeof loginSchema>;
export type PasswordResetRequestFields = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetFields = z.infer<typeof passwordResetSchema>;
