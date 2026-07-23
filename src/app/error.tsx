"use client";

import styles from "./resilience.module.css";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={styles.statePage}>
      <section className={styles.stateCard}>
        <span aria-hidden="true" className={styles.stateCode}>
          !
        </span>
        <h1>Algo saiu do lugar</h1>
        <p>Não conseguimos abrir esta parte da sua estante. Você pode tentar novamente.</p>
        <button onClick={reset} type="button">
          Tentar novamente
        </button>
      </section>
    </div>
  );
}
