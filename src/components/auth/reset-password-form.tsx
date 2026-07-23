"use client";

import { useActionState, useState } from "react";

import { resetPasswordAction } from "@/app/(auth)/actions";
import type { PasswordResetFields } from "@/lib/auth/schemas";
import type { ActionState } from "@/lib/auth/types";

const initialState: ActionState<PasswordResetFields> = { status: "idle" };

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} aria-label="Definir nova senha" className="auth-form">
      <p className="form-eyebrow">Sua estante protegida</p>
      <h2>Crie uma nova senha</h2>
      <p className="form-intro">Use pelo menos 8 caracteres e confirme abaixo.</p>

      {state.message ? (
        <p className="form-message form-message-error" role="alert">
          {state.message}
        </p>
      ) : null}

      <label htmlFor="new-password">Nova senha</label>
      <div className="password-field">
        <input
          aria-describedby={state.fieldErrors?.password ? "new-password-error" : undefined}
          aria-invalid={Boolean(state.fieldErrors?.password)}
          autoComplete="new-password"
          id="new-password"
          name="password"
          type={showPassword ? "text" : "password"}
        />
        <button
          aria-label={showPassword ? "Ocultar senhas" : "Mostrar senhas"}
          className="password-toggle"
          onClick={() => setShowPassword((visible) => !visible)}
          type="button"
        >
          {showPassword ? "Ocultar" : "Mostrar"}
        </button>
      </div>
      {state.fieldErrors?.password ? (
        <p className="field-error" id="new-password-error">
          {state.fieldErrors.password[0]}
        </p>
      ) : null}

      <label htmlFor="confirm-password">Confirmar nova senha</label>
      <input
        aria-describedby={
          state.fieldErrors?.confirmPassword ? "confirm-password-error" : undefined
        }
        aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
        autoComplete="new-password"
        id="confirm-password"
        name="confirmPassword"
        type={showPassword ? "text" : "password"}
      />
      {state.fieldErrors?.confirmPassword ? (
        <p className="field-error" id="confirm-password-error">
          {state.fieldErrors.confirmPassword[0]}
        </p>
      ) : null}

      <button className="primary-submit" disabled={pending} type="submit">
        {pending ? "Salvando…" : "Salvar nova senha"}
      </button>
    </form>
  );
}
