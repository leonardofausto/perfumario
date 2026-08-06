import styles from "@/components/usage-log/usage-diary.module.css";

export default function UsageDiaryLoading() {
  return (
    <div aria-label="Carregando Diário de uso" aria-live="polite" role="status">
      <span className={styles.loadingLine} />
      <span className={styles.loadingLine} />
      <span className={styles.loadingLine} />
      <span className="sr-only">Carregando seus registros de uso</span>
    </div>
  );
}
