"use client";

import { Trash2, X } from "lucide-react";
import { useState, useTransition } from "react";

import { deletePerfumeAction } from "@/features/perfumes/actions";

import styles from "./detail.module.css";

export function DeletePerfumeButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <>
      <button type="button" className={styles.deleteButton} onClick={() => setOpen(true)}>
        <Trash2 size={17} />
        Excluir perfume
      </button>

      {open ? (
        <div className={styles.dialogBackdrop}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-perfume-title"
            className={styles.dialog}
          >
            <button
              type="button"
              className={styles.dialogClose}
              aria-label="Fechar"
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </button>
            <h2 id="delete-perfume-title">Excluir {name}?</h2>
            <p>O perfume e sua imagem privada serão removidos da estante.</p>
            {message ? <p role="alert">{message}</p> : null}
            <div className={styles.dialogActions}>
              <button type="button" onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await deletePerfumeAction(id);
                    if (result.status === "error") {
                      setMessage(result.message ?? "Não foi possível excluir o perfume.");
                    }
                  })
                }
              >
                {pending ? "Excluindo..." : "Confirmar exclusão"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
