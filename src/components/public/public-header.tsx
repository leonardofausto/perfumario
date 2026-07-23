import { ShieldCheck } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "../brand/brand-mark";
import styles from "./public.module.css";

export function PublicHeader() {
  return (
    <header className={styles.header}>
      <BrandMark />
      <Link className={styles.signInLink} href="/login">
        <ShieldCheck aria-hidden="true" size={17} />
        Entrar
      </Link>
    </header>
  );
}
