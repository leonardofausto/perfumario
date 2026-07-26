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
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [selectedBrand, setSelectedBrand] = useState("all");

  const brands = useMemo(
    () =>
      [...new Set(perfumes.map((perfume) => perfume.brand))].sort((a, b) =>
        a.localeCompare(b, "pt-BR", { sensitivity: "base" }),
      ),
    [perfumes],
  );

  const filteredPerfumes = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");

    return perfumes
      .filter((perfume) => {
        const identity = `${perfume.brand} ${perfume.name}`.toLocaleLowerCase("pt-BR");
        const matchesSearch = identity.includes(normalizedSearch);
        const matchesFavorite = filter === "all" || perfume.isFavorite;
        const matchesBrand =
          selectedBrand === "all" || perfume.brand === selectedBrand;

        return matchesSearch && matchesFavorite && matchesBrand;
      })
      .sort(comparePerfumes);
  }, [filter, perfumes, search, selectedBrand]);

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
          <Plus size={18} />
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
              <div className={styles.searchField}>
                <label className={styles.srOnly} htmlFor="collection-search">
                  Buscar na coleção
                </label>
                <input
                  id="collection-search"
                  type="search"
                  placeholder="Buscar por perfume ou marca"
                  className={styles.searchInput}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <select
                aria-label="Exibir perfumes"
                className={styles.filterSelect}
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value as "all" | "favorites")
                }
              >
                <option value="all">Todos</option>
                <option value="favorites">Somente favoritos</option>
              </select>

              {brands.length > 0 ? (
                <select
                  aria-label="Filtrar por marca"
                  className={styles.filterSelect}
                  value={selectedBrand}
                  onChange={(event) => setSelectedBrand(event.target.value)}
                >
                  <option value="all">Todas as marcas</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
          </div>

          {filteredPerfumes.length > 0 ? (
            <div className={styles.grid}>
              {filteredPerfumes.map((perfume) => (
                <PerfumeCard
                  key={perfume.id}
                  perfume={perfume}
                  favoritePending={isPending}
                  onToggleFavorite={() => toggleFavorite(perfume)}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <strong>Nenhum perfume corresponde aos filtros.</strong>
              <p>Limpe a busca ou escolha outra marca para rever sua estante.</p>
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
