"use client";

import { TriangleAlert, Trash2, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import { deletePerfumeAction } from "@/features/perfumes/actions";

import styles from "./detail.module.css";

export function DeletePerfumeButton({
  id,
  name,
  className,
  label = "Excluir perfume",
  ariaLabel,
  showIcon = true,
  showLabel = true,
}: {
  id: string;
  name: string;
  className?: string;
  label?: string;
  ariaLabel?: string;
  showIcon?: boolean;
  showLabel?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    function closeOtherDialogs(event: Event) {
      if (event instanceof CustomEvent && event.detail !== id) {
        setOpen(false);
      }
    }

    window.addEventListener("perfumario:delete-dialog-open", closeOtherDialogs);
    return () => {
      window.removeEventListener("perfumario:delete-dialog-open", closeOtherDialogs);
    };
  }, [id]);

  function openDialog() {
    window.dispatchEvent(new CustomEvent("perfumario:delete-dialog-open", { detail: id }));
    setOpen(true);
  }

  const dialog = open ? (
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
          <X size={18} aria-hidden="true" />
        </button>

        <div className={styles.dialogTitleRow}>
          <span className={styles.dialogTitleIcon} aria-hidden="true">
            <Trash2 size={20} />
          </span>
          <h2 id="delete-perfume-title">Excluir fragrância?</h2>
        </div>

        <div className={styles.dialogCopy}>
          <p>
            O perfume <strong>{name}</strong> será removido da sua estante.
          </p>
          <p className={styles.dialogWarning}>
            <TriangleAlert size={15} aria-hidden="true" />
            <span>Esta ação é permanente e não poderá ser desfeita.</span>
          </p>
        </div>

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
            {pending ? "Excluindo…" : "Confirmar exclusão"}
          </button>
        </div>
      </section>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        className={className ?? styles.deleteButton}
        aria-label={ariaLabel ?? label}
        onClick={openDialog}
      >
        {showIcon ? <Trash2 size={17} aria-hidden="true" /> : null}
        {showLabel ? label : null}
      </button>

      {dialog}
    </>
  );
}
