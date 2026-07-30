import { notFound } from "next/navigation";

import { PerfumeDetail } from "@/components/collection/perfume-detail";
import { getOwnPerfume } from "@/features/perfumes/queries";

export default async function PerfumeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const origin = searchParams ? await searchParams : undefined;
  const perfume = await getOwnPerfume(id);

  if (!perfume) notFound();

  return (
    <PerfumeDetail
      perfume={perfume}
      backHref={origin?.from === "recomendador" ? "/recomendador" : "/colecao"}
      backLabel={
        origin?.from === "recomendador"
          ? "Voltar ao Recomendador"
          : "Voltar para a cole\u00e7\u00e3o"
      }
    />
  );
}
