import Link from "next/link";

import styles from "./resilience.module.css";

export default function NotFound() {
  return (
    <div className={styles.statePage}>
      <section className={styles.stateCard}>
        <span aria-hidden="true" className={styles.stateCode}>
          404
        </span>
        <h1>Esta fragrância não está na estante</h1>
        <p>O endereço pode ter mudado ou esta página ainda não existe.</p>
        <Link href="/">Voltar ao início</Link>
      </section>
    </div>
  );
}
