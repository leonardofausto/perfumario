"use client";

import styles from "@/components/usage-log/usage-diary.module.css";

export default function UsageDiaryError({ reset }: { reset: () => void }) {
  return (
    <section className={styles.routeError}>
      <p className={styles.kicker}>Diário indisponível</p>
      <h1>Não foi possível abrir seus registros</h1>
      <p>Tente novamente para recarregar somente o Diário de uso.</p>
      <button onClick={reset} type="button">
        Tentar novamente
      </button>
    </section>
  );
}
