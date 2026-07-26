"use client";

import { Droplets, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { PerfumeSummary } from "@/features/perfumes/types";

import styles from "./collection.module.css";

interface PerfumeCardProps {
  perfume: PerfumeSummary;
  favoritePending: boolean;
  onToggleFavorite: () => void;
}

const concentrationLabels = {
  parfum: "Parfum",
  eau_de_parfum: "Eau de parfum",
  eau_de_toilette: "Eau de toilette",
  eau_de_cologne: "Eau de cologne",
  body_splash: "Body splash",
  perfume_oil: "Óleo perfumado",
  other: "Outra concentração",
};

export function PerfumeCard({
  perfume,
  favoritePending,
  onToggleFavorite,
}: PerfumeCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.cardFavorite}>
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
      </div>

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
              sizes="(min-width: 1100px) 30vw, (min-width: 720px) 45vw, 90vw"
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
          <div className={styles.cardMeta}>
            <span>{concentrationLabels[perfume.concentration]}</span>
            <span>{perfume.bottleFormat === "decant" ? "Decant" : "Frasco inteiro"}</span>
          </div>
          {perfume.inspirationKind !== "original" ? (
            <span className={styles.inspiration}>
              {perfume.inspirationKind === "dupe" ? "Dupe" : "Inspiração"} de{" "}
              {perfume.inspiredBy}
            </span>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
