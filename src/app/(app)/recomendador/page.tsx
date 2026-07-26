import { PageHeader } from "@/components/ui/page-header";
import { RecommenderView } from "@/components/recommender/recommender-view";
import { listOwnPerfumes } from "@/features/perfumes/queries";
import styles from "@/components/ui/workspace.module.css";

export default async function RecommenderPage() {
  const perfumes = await listOwnPerfumes();

  return (
    <div className={styles.page}>
      <PageHeader
        description="Informe o contexto e descubra qual perfume da sua coleção combina melhor com o momento."
        eyebrow="INTELIGÊNCIA DA ESTANTE"
        title="Recomendador"
      />
      <RecommenderView perfumes={perfumes} />
    </div>
  );
}
