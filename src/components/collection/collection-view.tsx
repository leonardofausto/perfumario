"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { toggleFavoriteAction } from "@/features/perfumes/actions";
import type { PerfumeSummary } from "@/features/perfumes/types";

import styles from "./collection.module.css";
import { PerfumeCard } from "./perfume-card";

type CollectionViewProps = {
  perfumes: PerfumeSummary[];
};

const pageSizeOptions = [25, 50, 100, 200] as const;

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
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [pageSize, setPageSize] = useState<(typeof pageSizeOptions)[number]>(25);
  const [page, setPage] = useState(1);

  const brands = useMemo(
    () =>
      [...new Set(perfumes.map((perfume) => perfume.brand))].sort((a, b) =>
        a.localeCompare(b, "pt-BR", { sensitivity: "base" }),
      ),
    [perfumes],
  );

  const filteredPerfumes = useMemo(() => {
    return perfumes
      .filter((perfume) => {
        const matchesFavorite = filter === "all" || perfume.isFavorite;
        const matchesBrand = selectedBrand === "all" || perfume.brand === selectedBrand;

        return matchesFavorite && matchesBrand;
      })
      .sort(comparePerfumes);
  }, [filter, perfumes, selectedBrand]);

  const totalPages = Math.max(1, Math.ceil(filteredPerfumes.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const visiblePerfumes = filteredPerfumes.slice(pageStart, pageStart + pageSize);
  const rangeStart = filteredPerfumes.length === 0 ? 0 : pageStart + 1;
  const rangeEnd = pageStart + visiblePerfumes.length;

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
          <span className={styles.eyebrow}>Estante particular</span>
          <h1>Minha Coleção</h1>
          <p className={styles.subtitle}>
            Sua biblioteca de fragrâncias, organizada para consultar cada detalhe.
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
              {filteredPerfumes.length}{" "}
              {filteredPerfumes.length === 1 ? "perfume" : "perfumes"}
            </div>

            <div className={styles.filterControls}>
              <label className={styles.filterField}>
                <span>Status</span>
                <select
                  aria-label="Filtrar por status"
                  className={styles.filterSelect}
                  value={filter}
                  onChange={(event) => {
                    setFilter(event.target.value as "all" | "favorites");
                    setPage(1);
                  }}
                >
                  <option value="all">Selecione</option>
                  <option value="favorites">Somente favoritos</option>
                </select>
              </label>

              {brands.length > 0 ? (
                <label className={styles.filterField}>
                  <span>Marcas</span>
                  <select
                    aria-label="Filtrar por marca"
                    className={styles.filterSelect}
                    value={selectedBrand}
                    onChange={(event) => {
                      setSelectedBrand(event.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="all">Selecione</option>
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </div>
          </div>

          {visiblePerfumes.length > 0 ? (
            <>
              <div className={styles.grid}>
                {visiblePerfumes.map((perfume) => (
                  <PerfumeCard
                    key={perfume.id}
                    perfume={perfume}
                    favoritePending={isPending}
                    onToggleFavorite={() => toggleFavorite(perfume)}
                  />
                ))}
              </div>

              <div className={styles.pagination}>
                <p className={styles.paginationSummary}>
                  {rangeStart}-{rangeEnd} de {filteredPerfumes.length}{" "}
                  {filteredPerfumes.length === 1 ? "perfume" : "perfumes"}
                </p>

                <div className={styles.paginationControls}>
                  <button
                    type="button"
                    className={styles.pageButton}
                    disabled={currentPage === 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    Anterior
                  </button>
                  <span className={styles.pageCount}>
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    type="button"
                    aria-label="Próxima página"
                    className={styles.pageButton}
                    disabled={currentPage === totalPages}
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  >
                    Próxima
                  </button>
                </div>

                <label className={styles.pageSizeControl}>
                  <span>Perfumes por página</span>
                  <select
                    aria-label="Perfumes por página"
                    className={styles.filterSelect}
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value) as (typeof pageSizeOptions)[number]);
                      setPage(1);
                    }}
                  >
                    {pageSizeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <strong>Nenhum perfume corresponde aos filtros.</strong>
              <p>Ajuste os filtros para rever sua estante.</p>
            </div>
          )}
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
