import Image from "next/image";
import type { ReactNode } from "react";

import { BrandMark } from "../brand/brand-mark";
import styles from "./auth-shell.module.css";

export function AuthShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.photograph}>
          <Image
            alt="Coleção de perfumes em uma estante"
            fill
            priority
            sizes="(max-width: 840px) 100vw, 60vw"
            src="/images/login-perfumes.png"
          />
          <div className={styles.overlay} />
          <div className={styles.photoContent}>
            <BrandMark inverse />
            <div>
              <p className={styles.kicker}>Perfumes · memórias · momentos</p>
              <h1>Sua estante, sua história.</h1>
              <p>Organize sua coleção e encontre a fragrância certa para cada momento.</p>
            </div>
          </div>
        </div>
        <section className={styles.formPanel}>{children}</section>
      </section>
    </main>
  );
}
