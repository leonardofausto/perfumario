import { Sparkles } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import styles from "@/components/ui/workspace.module.css";

export default function RecommenderPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        description="Combine clima, horário, ocasião e estilo para descobrir a melhor escolha da sua coleção."
        eyebrow="Inteligência da estante"
        title="Recomendador"
      />
      <EmptyState
        action={{ href: "/colecao", label: "Ir para Minha Coleção" }}
        description="O recomendador precisa conhecer seus perfumes antes de criar um ranking confiável para o momento."
        icon={Sparkles}
        title="Primeiro, vamos montar sua coleção"
      />
    </div>
  );
}
