import { notFound } from "next/navigation";

import { PerfumeDetail } from "@/components/collection/perfume-detail";
import { getOwnPerfume } from "@/features/perfumes/queries";

export default async function PerfumeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const perfume = await getOwnPerfume(id);

  if (!perfume) notFound();

  return <PerfumeDetail perfume={perfume} />;
}
