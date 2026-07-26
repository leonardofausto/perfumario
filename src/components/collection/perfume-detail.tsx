import { ArrowLeft, Droplets, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { PerfumeDetail as PerfumeDetailData } from "@/features/perfumes/types";

import styles from "./detail.module.css";
import { FavoriteButton } from "./favorite-button";
import { OlfactoryFamilyChips } from "./olfactory-family-chips";
import { OlfactoryPyramid } from "./olfactory-pyramid";
import { PerformanceRadar } from "./performance-radar";
import { SuitabilityGrid } from "./suitability-grid";

const concentrationLabels = {
  parfum: "Parfum",
  eau_de_parfum: "Eau de parfum",
  eau_de_toilette: "Eau de toilette",
  eau_de_cologne: "Eau de cologne",
  body_splash: "Body splash",
  perfume_oil: "Óleo perfumado",
  other: "Outra concentração",
};

export function PerfumeDetail({ perfume }: { perfume: PerfumeDetailData }) {
  return (
    <article className={styles.page}>
      <nav className={styles.backRow} aria-label="Navegação da coleção">
        <Link href="/colecao">
          <ArrowLeft size={17} />
          Voltar para a coleção
        </Link>
      </nav>

      <header className={styles.hero}>
        <div className={styles.heroImage}>
          {perfume.imageUrl ? (
            <Image
              src={perfume.imageUrl}
              alt={`Frasco de ${perfume.name}`}
              fill
              sizes="(min-width: 900px) 38vw, 90vw"
              unoptimized
            />
          ) : (
            <div className={styles.heroFallback} aria-hidden="true">
              <Droplets size={44} />
              <span>{perfume.name.slice(0, 1).toLocaleUpperCase("pt-BR")}</span>
            </div>
          )}
        </div>

        <div className={styles.heroCopy}>
          <span className={styles.brand}>{perfume.brand}</span>
          <h1>{perfume.name}</h1>
          <div className={styles.identityMeta}>
            <span>{concentrationLabels[perfume.concentration]}</span>
            <span>{perfume.bottleFormat === "decant" ? "Decant" : "Frasco inteiro"}</span>
          </div>
          {perfume.inspirationKind !== "original" ? (
            <p className={styles.inspiration}>
              {perfume.inspirationKind === "dupe" ? "Dupe" : "Inspiração"} de{" "}
              {perfume.inspiredBy}
            </p>
          ) : (
            <p className={styles.inspiration}>Criação original</p>
          )}
          <OlfactoryFamilyChips families={perfume.olfactoryFamilies} />
          <p className={styles.description}>{perfume.description}</p>
          <div className={styles.heroActions}>
            <FavoriteButton id={perfume.id} isFavorite={perfume.isFavorite} />
            <Link href={`/colecao/${perfume.id}/editar`} className={styles.editButton}>
              <Pencil size={17} />
              Editar perfume
            </Link>
          </div>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <span>Composição</span>
          <h2>Pirâmide olfativa</h2>
          <p>Da primeira impressão à assinatura que permanece na pele.</p>
        </div>
        <OlfactoryPyramid notes={perfume.notes} />
      </section>

      <section className={`${styles.section} ${styles.performanceSection}`}>
        <div className={styles.sectionHeading}>
          <span>Comportamento</span>
          <h2>Desempenho</h2>
          <p>Uma leitura visual da presença desta fragrância.</p>
        </div>
        <PerformanceRadar scores={perfume.scores} />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <span>Quando usar</span>
          <h2>Clima, ocasião e horário</h2>
          <p>Percentuais orientativos para escolher o melhor momento.</p>
        </div>
        <SuitabilityGrid scores={perfume.scores} />
      </section>
    </article>
  );
}
