"use client";

import { Droplets, Heart, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { PerfumeSummary } from "@/features/perfumes/types";

import styles from "./collection.module.css";
import { DeletePerfumeButton } from "./delete-perfume-button";

interface PerfumeCardProps {
  perfume: PerfumeSummary;
  favoritePending: boolean;
  onToggleFavorite: () => void;
}

export function PerfumeCard({
  perfume,
  favoritePending,
  onToggleFavorite,
}: PerfumeCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.cardActions}>
        <button
          type="button"
          aria-label={`${perfume.isFavorite ? "Remover" : "Adicionar"} ${perfume.name} ${
            perfume.isFavorite ? "dos" : "aos"
          } favoritos`}
          className={`${styles.iconBtn} ${
            perfume.isFavorite ? styles.iconBtnFavoriteActive : ""
          }`}
          disabled={favoritePending}
          onClick={onToggleFavorite}
        >
          <Heart size={18} fill={perfume.isFavorite ? "currentColor" : "none"} />
        </button>
        <Link
          href={`/colecao/${perfume.id}/editar`}
          className={styles.iconBtn}
          aria-label={`Editar ${perfume.name}`}
        >
          <Pencil size={17} aria-hidden="true" />
        </Link>
      </div>
      <DeletePerfumeButton
        id={perfume.id}
        name={perfume.name}
        className={`${styles.iconBtn} ${styles.iconBtnDanger} ${styles.deleteIconBtn}`}
        label="Excluir"
        ariaLabel={`Excluir ${perfume.name}`}
        showLabel={false}
      />

      <Link
        href={`/colecao/${perfume.id}`}
        className={styles.cardLink}
        aria-label={`Ver detalhes de ${perfume.name}`}
      >
        <div className={styles.imageContainer}>
          {perfume.imageUrl ? (
            <Image
              src={perfume.imageUrl}
              alt={`Frasco de ${perfume.name}`}
              className={styles.image}
              fill
              sizes="(min-width: 1280px) 24vw, (min-width: 760px) 48vw, 92vw"
              unoptimized
            />
          ) : (
            <div className={styles.imageFallback} aria-hidden="true">
              <Droplets size={34} />
              <span>{perfume.name.slice(0, 1).toLocaleUpperCase("pt-BR")}</span>
            </div>
          )}
        </div>

        <div className={styles.cardContent}>
          <span className={styles.brand}>{perfume.brand}</span>
          <h2 className={styles.name}>{perfume.name}</h2>
        </div>
      </Link>
    </article>
  );
}
