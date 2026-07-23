"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  loginSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  type LoginFields,
  type PasswordResetFields,
  type PasswordResetRequestFields,
} from "@/lib/auth/schemas";
import type { ActionState } from "@/lib/auth/types";
import { createServerSupabase } from "@/lib/supabase/server";

const recoveryMessage =
  "Se esse e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function fieldErrors<T extends Record<string, string>>(
  errors: Record<string, string[] | undefined>,
) {
  return errors as ActionState<T>["fieldErrors"];
}

async function requestOrigin() {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");

  if (origin) return origin;

  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

export async function loginAction(
  _previousState: ActionState<LoginFields>,
  formData: FormData,
): Promise<ActionState<LoginFields>> {
  const fields = {
    email: text(formData, "email").trim(),
    password: text(formData, "password"),
  };
  const parsed = loginSchema.safeParse(fields);

  if (!parsed.success) {
    return {
      status: "error",
      fields: { email: fields.email },
      fieldErrors: fieldErrors<LoginFields>(parsed.error.flatten().fieldErrors),
    };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      status: "error",
      message: "Não foi possível entrar com essas credenciais.",
      fields: { email: parsed.data.email },
    };
  }

  redirect("/dashboard");
}

export async function requestPasswordResetAction(
  _previousState: ActionState<PasswordResetRequestFields>,
  formData: FormData,
): Promise<ActionState<PasswordResetRequestFields>> {
  const fields = { email: text(formData, "email").trim() };
  const parsed = passwordResetRequestSchema.safeParse(fields);

  if (!parsed.success) {
    return {
      status: "error",
      fields,
      fieldErrors: fieldErrors<PasswordResetRequestFields>(parsed.error.flatten().fieldErrors),
    };
  }

  const supabase = await createServerSupabase();
  const origin = await requestOrigin();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/redefinir-senha`,
  });

  return { status: "success", message: recoveryMessage };
}

export async function resetPasswordAction(
  _previousState: ActionState<PasswordResetFields>,
  formData: FormData,
): Promise<ActionState<PasswordResetFields>> {
  const fields = {
    password: text(formData, "password"),
    confirmPassword: text(formData, "confirmPassword"),
  };
  const parsed = passwordResetSchema.safeParse(fields);

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrors<PasswordResetFields>(parsed.error.flatten().fieldErrors),
    };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return {
      status: "error",
      message: "O link não é mais válido. Solicite uma nova recuperação de senha.",
    };
  }

  await supabase.auth.signOut({ scope: "local" });
  redirect("/login?senha=alterada");
}
