import type { LucideIcon } from "lucide-react";

import styles from "@/components/ui/workspace.module.css";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: number;
};

export function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <article className={styles.statCard}>
      <div className={styles.statTop}>
        <span>{label}</span>
        <span aria-hidden="true" className={styles.statIcon}>
          <Icon aria-hidden="true" size={18} />
        </span>
      </div>
      <strong className={styles.statValue}>{value}</strong>
    </article>
  );
}
