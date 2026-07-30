import type { ReactNode } from "react";

import styles from "./workspace.module.css";

type PageHeaderProps = {
  action?: ReactNode;
  description: string;
  descriptionClassName?: string;
  eyebrow?: string;
  title: string;
};

export function PageHeader({
  action,
  description,
  descriptionClassName,
  eyebrow,
  title,
}: PageHeaderProps) {
  return (
    <header className={styles.pageHeader}>
      <div>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h1>{title}</h1>
        <p className={descriptionClassName}>{description}</p>
      </div>
      {action}
    </header>
  );
}
