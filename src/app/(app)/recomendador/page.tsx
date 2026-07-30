import { PageHeader } from "@/components/ui/page-header";
import { RecommenderView } from "@/components/recommender/recommender-view";
import { listOwnRecommenderPerfumes } from "@/features/perfumes/queries";
import recommenderStyles from "@/components/recommender/recommender.module.css";
import styles from "@/components/ui/workspace.module.css";

export default async function RecommenderPage() {
  const perfumes = await listOwnRecommenderPerfumes();

  return (
    <div className={styles.page}>
      <PageHeader
        descriptionClassName={recommenderStyles.recommenderDescription}
        description="Informe o contexto e descubra qual perfume da sua coleção combina melhor com o momento."
        eyebrow="INTELIGÊNCIA DA ESTANTE"
        title="Recomendador"
      />
      <RecommenderView perfumes={perfumes} />
    </div>
  );
}
