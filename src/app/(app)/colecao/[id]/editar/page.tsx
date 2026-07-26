import { notFound } from "next/navigation";

import { PerfumeForm } from "@/components/collection/perfume-form";
import { getOwnPerfume } from "@/features/perfumes/queries";

export default async function EditPerfumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const perfume = await getOwnPerfume(id);

  if (!perfume) notFound();

  return <PerfumeForm perfume={perfume} />;
}
