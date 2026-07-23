import { LibraryBig, Plus } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import styles from "@/components/ui/workspace.module.css";

export default function CollectionPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        description="Organize suas fragrâncias e encontre cada perfume com facilidade."
        eyebrow="Sua estante"
        title="Minha Coleção"
      />
      <EmptyState
        action={{ href: "/colecao", icon: Plus, label: "Começar coleção" }}
        description="O cadastro de perfumes chega na próxima etapa do projeto. Sua coleção será privada e visível somente para você."
        icon={LibraryBig}
        title="Pronta para receber seus perfumes"
      />
    </div>
  );
}
