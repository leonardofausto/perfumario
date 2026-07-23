import styles from "./resilience.module.css";

export default function Loading() {
  return (
    <div className={styles.statePage}>
      <div aria-live="polite" className={styles.stateCard} role="status">
        <span aria-hidden="true" className={styles.loadingMark} />
        <h1>Carregando sua estante…</h1>
        <p>Estamos preparando cada detalhe do Perfumário.</p>
      </div>
    </div>
  );
}
