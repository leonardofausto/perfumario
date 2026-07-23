"use client";

import Link from "next/link";
import { useActionState } from "react";

import { requestPasswordResetAction } from "@/app/(auth)/actions";
import type { PasswordResetRequestFields } from "@/lib/auth/schemas";
import type { ActionState } from "@/lib/auth/types";

const initialState: ActionState<PasswordResetRequestFields> = { status: "idle" };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    initialState,
  );

  return (
    <form action={formAction} aria-label="Recuperar senha" className="auth-form">
      <p className="form-eyebrow">Recuperação segura</p>
      <h2>Esqueceu sua senha?</h2>
      <p className="form-intro">
        Informe o e-mail do convite e enviaremos as próximas instruções.
      </p>

      {state.message ? (
        <p className="form-message form-message-success" role="status">
          {state.message}
        </p>
      ) : null}

      <label htmlFor="recovery-email">E-mail</label>
      <input
        aria-describedby={state.fieldErrors?.email ? "recovery-email-error" : undefined}
        aria-invalid={Boolean(state.fieldErrors?.email)}
        autoComplete="email"
        defaultValue={state.fields?.email}
        id="recovery-email"
        name="email"
        placeholder="seu@email.com"
        type="email"
      />
      {state.fieldErrors?.email ? (
        <p className="field-error" id="recovery-email-error">
          {state.fieldErrors.email[0]}
        </p>
      ) : null}

      <button className="primary-submit" disabled={pending} type="submit">
        {pending ? "Enviando…" : "Enviar instruções"}
      </button>
      <Link className="form-link form-link-start" href="/login">
        Voltar para entrar
      </Link>
    </form>
  );
}
