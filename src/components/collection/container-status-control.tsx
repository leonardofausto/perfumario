"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import {
  CONTAINER_LEVEL_LABELS,
  REPLENISHMENT_INTENT_LABELS,
  getContainerAlert,
  intentsForContainer,
} from "@/features/experience/container-status";
import type {
  ContainerLevel,
  ReplenishmentIntent,
} from "@/features/experience/types";
import {
  updateContainerStatusAction,
  type ContainerStatusActionFields,
} from "@/features/perfumes/actions";
import type { BottleFormat } from "@/features/perfumes/types";
import type { ActionState } from "@/lib/auth/types";

import styles from "./container-status.module.css";

const initialState: ActionState<ContainerStatusActionFields> = { status: "idle" };

export function ContainerStatusControl({
  perfumeId,
  bottleFormat,
  initialLevel,
  initialIntent,
  updatedAt,
}: {
  perfumeId: string;
  bottleFormat: BottleFormat;
  initialLevel: ContainerLevel;
  initialIntent: ReplenishmentIntent | null;
  updatedAt: string | null;
}) {
  const router = useRouter();
  const [level, setLevel] = useState(initialLevel);
  const [intent, setIntent] = useState<ReplenishmentIntent | null>(initialIntent);
  const action = updateContainerStatusAction.bind(null, perfumeId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const alert = getContainerAlert(level);
  const mayChooseIntent = level === "low" || level === "empty";
  const intentOptions = intentsForContainer(bottleFormat);

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);

  return (
    <section
      className={styles.panel}
      aria-label="Nível e reposição"
      data-container-type={bottleFormat}
    >
      <div className={styles.heading}>
        <div>
          <span>Acompanhamento</span>
          <h2>Nível e reposição</h2>
        </div>
        {alert ? (
          <strong className={alert.tone === "action" ? styles.actionAlert : styles.attentionAlert}>
            {alert.tone === "action" ? "Ação necessária" : "Atenção"}
          </strong>
        ) : null}
      </div>

      <div
        role="progressbar"
        aria-label={`Nível qualitativo: ${CONTAINER_LEVEL_LABELS[level]}`}
        className={`${styles.levelBar} ${styles[`level_${level}`]}`}
      >
        <span aria-hidden="true" />
      </div>

      <dl className={styles.summary}>
        <div>
          <dt>Tipo</dt>
          <dd>{bottleFormat === "decant" ? "Decant" : "Frasco"}</dd>
        </div>
        <div>
          <dt>Nível</dt>
          <dd>{CONTAINER_LEVEL_LABELS[level]}</dd>
        </div>
        <div>
          <dt>Intenção</dt>
          <dd>{intent ? REPLENISHMENT_INTENT_LABELS[intent] : "Sem decisão"}</dd>
        </div>
        <div>
          <dt>Última atualização</dt>
          <dd>
            {updatedAt
              ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(
                  new Date(updatedAt),
                )
              : "Não informado"}
          </dd>
        </div>
      </dl>

      <form action={formAction} className={styles.form}>
        <fieldset>
          <legend>Nível do recipiente</legend>
          <div className={styles.segmented}>
            {Object.entries(CONTAINER_LEVEL_LABELS).map(([value, label]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="level"
                  value={value}
                  checked={level === value}
                  onChange={() => setLevel(value as ContainerLevel)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {mayChooseIntent ? (
          <fieldset>
            <legend>Intenção de reposição</legend>
            <div className={styles.segmented}>
              <label>
                <input
                  type="radio"
                  name="replenishmentIntent"
                  value=""
                  checked={intent === null}
                  onChange={() => setIntent(null)}
                />
                <span>Sem decisão</span>
              </label>
              {intentOptions.map((value) => (
                <label key={value}>
                  <input
                    type="radio"
                    name="replenishmentIntent"
                    value={value}
                    checked={intent === value}
                    onChange={() => setIntent(value)}
                  />
                  <span>{REPLENISHMENT_INTENT_LABELS[value]}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          <input type="hidden" name="replenishmentIntent" value={intent ?? ""} />
        )}

        {state.status === "error" && state.message ? (
          <p className={styles.error} role="alert">{state.message}</p>
        ) : null}
        {state.status === "success" ? (
          <p className={styles.success} role="status">Acompanhamento atualizado.</p>
        ) : null}
        <button type="submit" className={styles.submit} disabled={pending}>
          {pending ? "Salvando…" : "Salvar acompanhamento"}
        </button>
      </form>
    </section>
  );
}
