"use client";

import Image from "next/image";
import { useActionState, useEffect, useState } from "react";

import { updateAvatarAction } from "@/app/(app)/perfil/actions";

import styles from "./profile.module.css";

type AvatarUploadProps = {
  avatarUrl: string | null;
  displayName: string;
};

function initials(displayName: string) {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "P";
}

export function AvatarUpload({ avatarUrl, displayName }: AvatarUploadProps) {
  const [state, formAction, pending] = useActionState(updateAvatarAction, { status: "idle" });
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  return (
    <section className={`${styles.card} ${styles.avatarStage}`}>
      <h2>Sua imagem</h2>
      <p className={styles.cardIntro}>Um detalhe pessoal para reconhecer sua estante.</p>
      <span className={styles.avatarPreview}>
        {preview || avatarUrl ? (
          <Image
            alt={`Avatar de ${displayName}`}
            fill
            sizes="150px"
            src={preview || avatarUrl || ""}
            unoptimized={Boolean(preview)}
          />
        ) : (
          <span aria-hidden="true">{initials(displayName)}</span>
        )}
      </span>
      <form action={formAction} className={styles.form}>
        <label htmlFor="avatar">Foto do perfil</label>
        <input
          accept="image/jpeg,image/png,image/webp"
          className={styles.fileInput}
          id="avatar"
          name="avatar"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setPreview((current) => {
              if (current) URL.revokeObjectURL(current);
              return file ? URL.createObjectURL(file) : null;
            });
          }}
          type="file"
        />
        <p className={styles.helper}>JPEG, PNG ou WebP · máximo de 5 MB.</p>
        {state.fieldErrors?.avatar ? (
          <p className={styles.error} role="alert">
            {state.fieldErrors.avatar[0]}
          </p>
        ) : null}
        <button className={styles.uploadButton} disabled={pending} type="submit">
          {pending ? "Enviando…" : "Atualizar avatar"}
        </button>
        <p aria-live="polite" className={state.status === "error" ? styles.error : styles.message}>
          {state.message}
        </p>
      </form>
    </section>
  );
}
