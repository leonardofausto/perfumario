import { Clock3 } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import styles from "@/components/ui/workspace.module.css";

export default function HistoryPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        description="Revisite escolhas e acompanhe como a sua relação com cada fragrância evolui."
        eyebrow="Memória olfativa"
        title="Histórico"
      />
      <EmptyState
        action={{ href: "/recomendador", label: "Conhecer o Recomendador" }}
        description="Suas recomendações e usos futuros aparecerão aqui para ajudar o sistema a aprender com você."
        icon={Clock3}
        title="Ainda não há momentos registrados"
      />
    </div>
  );
}
