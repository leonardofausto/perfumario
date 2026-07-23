"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { loginAction } from "@/app/(auth)/actions";
import type { LoginFields } from "@/lib/auth/schemas";
import type { ActionState } from "@/lib/auth/types";

const initialState: ActionState<LoginFields> = { status: "idle" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} aria-label="Entrar na sua estante" className="auth-form">
      <p className="form-eyebrow">Bem-vindo de volta</p>
      <h2>Entre na sua estante</h2>
      <p className="form-intro">Use o e-mail do seu convite para continuar.</p>

      {state.message ? (
        <p className="form-message form-message-error" role="alert">
          {state.message}
        </p>
      ) : null}

      <label htmlFor="email">E-mail</label>
      <input
        aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
        aria-invalid={Boolean(state.fieldErrors?.email)}
        autoComplete="email"
        defaultValue={state.fields?.email}
        id="email"
        name="email"
        placeholder="seu@email.com"
        type="email"
      />
      {state.fieldErrors?.email ? (
        <p className="field-error" id="email-error">
          {state.fieldErrors.email[0]}
        </p>
      ) : null}

      <label htmlFor="password">Senha</label>
      <div className="password-field">
        <input
          aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
          aria-invalid={Boolean(state.fieldErrors?.password)}
          autoComplete="current-password"
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
        />
        <button
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          className="password-toggle"
          onClick={() => setShowPassword((visible) => !visible)}
          type="button"
        >
          {showPassword ? "Ocultar" : "Mostrar"}
        </button>
      </div>
      {state.fieldErrors?.password ? (
        <p className="field-error" id="password-error">
          {state.fieldErrors.password[0]}
        </p>
      ) : null}

      <Link className="form-link" href="/recuperar-senha">
        Esqueci minha senha
      </Link>
      <button className="primary-submit" disabled={pending} type="submit">
        {pending ? "Entrando…" : "Entrar"}
      </button>
      <small>Acesso privado por convite</small>
    </form>
  );
}
