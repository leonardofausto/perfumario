import { CollectionView } from "@/components/collection/collection-view";
import { listOwnPerfumes } from "@/features/perfumes/queries";

export default async function CollectionPage() {
  const perfumes = await listOwnPerfumes();

  return <CollectionView perfumes={perfumes} />;
}
