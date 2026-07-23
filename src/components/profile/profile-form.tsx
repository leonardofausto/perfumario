"use client";

import { useActionState } from "react";

import { updateProfileAction } from "@/app/(app)/perfil/actions";

import { AvatarUpload } from "./avatar-upload";
import styles from "./profile.module.css";

type ProfileFormProps = {
  email: string;
  profile: { avatarUrl: string | null; displayName: string };
};

export function ProfileForm({ email, profile }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateProfileAction, {
    status: "idle",
    fields: { displayName: profile.displayName },
  });

  return (
    <div className={styles.profileGrid}>
      <AvatarUpload avatarUrl={profile.avatarUrl} displayName={profile.displayName} />
      <section className={styles.card}>
        <h2>Dados da conta</h2>
        <p className={styles.cardIntro}>Escolha como seu nome aparece dentro do Perfumário.</p>
        <form action={formAction} className={styles.form}>
          <label htmlFor="displayName">Nome de exibição</label>
          <input
            aria-describedby={state.fieldErrors?.displayName ? "display-name-error" : undefined}
            aria-invalid={Boolean(state.fieldErrors?.displayName)}
            defaultValue={state.fields?.displayName ?? profile.displayName}
            id="displayName"
            maxLength={80}
            name="displayName"
          />
          {state.fieldErrors?.displayName ? (
            <p className={styles.error} id="display-name-error">
              {state.fieldErrors.displayName[0]}
            </p>
          ) : null}

          <label htmlFor="profile-email">E-mail</label>
          <input id="profile-email" readOnly type="email" value={email} />
          <p className={styles.helper}>O e-mail de acesso é gerenciado pelo convite privado.</p>

          <button disabled={pending} type="submit">
            {pending ? "Salvando…" : "Salvar alterações"}
          </button>
          <p aria-live="polite" className={state.status === "error" ? styles.error : styles.message}>
            {state.message}
          </p>
        </form>
      </section>
    </div>
  );
}
