import styles from "../resilience.module.css";

export default function AppLoading() {
  return (
    <div
      aria-label="Carregando área privada"
      aria-live="polite"
      className={styles.appLoading}
      role="status"
    >
      <span className={styles.skeleton} />
      <span className={styles.skeleton} />
      <span className={styles.skeleton} />
      <span className="sr-only">Carregando sua estante</span>
    </div>
  );
}
