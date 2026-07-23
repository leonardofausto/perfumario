import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import styles from "./workspace.module.css";

type EmptyStateProps = {
  action?: { href: string; icon?: LucideIcon; label: string };
  description: string;
  icon: LucideIcon;
  title: string;
};

export function EmptyState({ action, description, icon: Icon, title }: EmptyStateProps) {
  return (
    <section className={styles.emptyState}>
      <div className={styles.emptyContent}>
        <span aria-hidden="true" className={styles.emptyIcon}>
          <Icon aria-hidden="true" size={29} strokeWidth={1.7} />
        </span>
        <h2>{title}</h2>
        <p>{description}</p>
        {action ? (
          <Link href={action.href}>
            {action.icon ? <action.icon aria-hidden="true" size={17} /> : null}
            {action.label}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
