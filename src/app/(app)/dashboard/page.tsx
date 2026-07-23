import { Clock3, Heart, LibraryBig, Sparkles } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import styles from "@/components/ui/workspace.module.css";

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        description="Acompanhe sua estante e prepare o caminho para recomendações cada vez mais pessoais."
        eyebrow="Visão geral"
        title="Dashboard"
      />
      <section aria-label="Resumo da estante" className={styles.statsGrid}>
        <StatCard icon={LibraryBig} label="Perfumes na coleção" value={0} />
        <StatCard icon={Heart} label="Perfumes favoritos" value={0} />
        <StatCard icon={Clock3} label="Recomendações salvas" value={0} />
      </section>
      <EmptyState
        action={{ href: "/colecao", label: "Conhecer Minha Coleção" }}
        description="Quando seus perfumes estiverem cadastrados, o Perfumário poderá organizar escolhas por clima, ocasião e momento do dia."
        icon={Sparkles}
        title="Sua estante inteligente começa aqui"
      />
    </div>
  );
}
