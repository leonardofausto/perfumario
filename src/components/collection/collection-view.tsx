"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";

import { toggleFavoriteAction } from "@/features/perfumes/actions";
import type { PerfumeSummary } from "@/features/perfumes/types";

import styles from "./collection.module.css";
import { PerfumeCard } from "./perfume-card";

type CollectionViewProps = {
  perfumes: PerfumeSummary[];
};

function comparePerfumes(left: PerfumeSummary, right: PerfumeSummary) {
  if (left.isFavorite !== right.isFavorite) return left.isFavorite ? -1 : 1;

  return (
    left.name.localeCompare(right.name, "pt-BR", { sensitivity: "base" }) ||
    left.brand.localeCompare(right.brand, "pt-BR", { sensitivity: "base" })
  );
}

export function CollectionView({ perfumes }: CollectionViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const sortedPerfumes = useMemo(() => [...perfumes].sort(comparePerfumes), [perfumes]);

  function toggleFavorite(perfume: PerfumeSummary) {
    startTransition(async () => {
      const next = !perfume.isFavorite;
      const result = await toggleFavoriteAction(perfume.id, next);
      if (result.status !== "success") return;

      router.refresh();
    });
  }

  return (
    <div className={styles.container}>
      <header className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <h1>Minha Coleção</h1>
          <p className={styles.subtitle}>
            Organize suas fragrâncias e encontre cada perfume com facilidade.
          </p>
        </div>

        <Link href="/colecao/novo" className={styles.addButton}>
          <Plus size={18} aria-hidden="true" />
          Adicionar perfume
        </Link>
      </header>

      {perfumes.length > 0 ? (
        <>
          <div className={styles.toolbar}>
            <div className={styles.countLabel}>
              {sortedPerfumes.length} {sortedPerfumes.length === 1 ? "perfume" : "perfumes"}
            </div>
          </div>

          <div className={styles.grid}>
            {sortedPerfumes.map((perfume) => (
              <PerfumeCard
                key={perfume.id}
                perfume={perfume}
                favoritePending={isPending}
                onToggleFavorite={() => toggleFavorite(perfume)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className={styles.emptyState}>
          <span className={styles.emptyMonogram} aria-hidden="true">
            P
          </span>
          <strong>Sua estante ainda está vazia.</strong>
          <p>Adicione o primeiro perfume para começar sua coleção particular.</p>
          <Link href="/colecao/novo" className={styles.emptyLink}>
            Adicionar perfume
          </Link>
        </div>
      )}
    </div>
  );
}
