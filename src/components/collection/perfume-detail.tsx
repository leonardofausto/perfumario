import {
  ArrowLeft,
  Calendar,
  Candy,
  Droplets,
  Flame,
  Gem,
  Heart,
  Link as LinkIcon,
  Sparkles,
  Tags,
  Users,
  Wind,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { PerfumeDetail as PerfumeDetailData } from "@/features/perfumes/types";

import styles from "./detail.module.css";
import { FitFragranceTitle } from "./fit-fragrance-title";
import { MainAccords } from "./main-accords";
import { OlfactoryPyramid } from "./olfactory-pyramid";
import { PerformanceRadar } from "./performance-radar";
import { SuitabilityGrid } from "./suitability-grid";

const concentrationLabels = {
  unknown: "Não informado",
  body_splash: "Body Splash",
  eau_de_cologne: "Eau de Cologne (EDC)",
  eau_de_parfum: "Eau de Parfum (EDP)",
  eau_de_toilette: "Eau de Toilette (EDT)",
  perfume_oil: "Óleo Perfumado",
  other: "Outra",
  parfum: "Parfum",
};

const categoryLabels: Record<string, string> = {
  arabe: "Árabe",
  designer: "Designer",
  importado: "Importado",
  nacional: "Nacional",
  niche: "Nicho",
  indie: "Independente",
  artisanal: "Artesanal",
  other: "Outra",
};

const audienceLabels: Record<string, string> = {
  feminine: "Feminino",
  masculine: "Masculino",
  unisex: "Unissex",
  other: "Outro",
};

const profileMetrics = [
  ["Intensidade", "intensity", Flame],
  ["Docura", "sweetness", Candy],
  ["Frescor", "freshness", Wind],
  ["Elegância", "elegance", Gem],
  ["Sensualidade", "sensuality", Heart],
] as const;

export function PerfumeDetail({
  perfume,
  backHref = "/colecao",
  backLabel = "Voltar para a cole\u00e7\u00e3o",
}: {
  perfume: PerfumeDetailData;
  backHref?: string;
  backLabel?: string;
}) {
  const relationLabel =
    perfume.inspirationKind === "original"
      ? "Original"
      : perfume.inspirationKind === "dupe"
        ? "Dupe"
        : "Inspiração";

  return (
    <article className={styles.page}>
      <nav className={styles.backRow} aria-label="Navegação da coleção">
        <Link href={backHref}>
          <ArrowLeft size={17} />
          {backLabel}
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
          <FitFragranceTitle className={styles.fragranceTitle}>
            {perfume.name}
          </FitFragranceTitle>
          <p className={styles.description} lang="pt-BR">
            {perfume.description}
          </p>
          <dl className={styles.essentialMeta} aria-label="Informações essenciais">
            <div className={styles.metaItem}>
              <dt>
                <Droplets size={15} aria-hidden="true" />
                Concentração
              </dt>
              <dd>{concentrationLabels[perfume.concentration]}</dd>
            </div>
            <div className={styles.metaItem}>
              <dt>
                <Tags size={15} aria-hidden="true" />
                Categoria
              </dt>
              <dd>
                {perfume.categoryType
                  ? categoryLabels[perfume.categoryType] ?? perfume.categoryType
                  : "Não informado"}
              </dd>
            </div>
            <div className={styles.metaItem}>
              <dt>
                <LinkIcon size={15} aria-hidden="true" />
                Relação
              </dt>
              <dd>{relationLabel}</dd>
            </div>
            <div className={styles.metaItem}>
              <dt>
                <Sparkles size={15} aria-hidden="true" />
                Perfume de referência
              </dt>
              <dd>
                {perfume.inspirationKind === "original"
                  ? "Não se aplica"
                  : perfume.inspiredBy}
              </dd>
            </div>
            <div className={styles.metaItemSecondary}>
              <dt>
                <Calendar size={15} aria-hidden="true" />
                Ano de lançamento
              </dt>
              <dd>{perfume.launchYear ?? "Não informado"}</dd>
            </div>
            <div className={styles.metaItemSecondary}>
              <dt>
                <Users size={15} aria-hidden="true" />
                Público
              </dt>
              <dd>
                {perfume.audience
                  ? audienceLabels[perfume.audience] ?? perfume.audience
                : "Não informado"}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      {perfume.scores.some((score) => score.category === "accord" && score.score !== null) ? (
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <span>Perfil olfativo</span>
            <h2>Principais acordes</h2>
            <p>Facetas mais presentes na fragrância.</p>
          </div>
          <MainAccords scores={perfume.scores} />
        </section>
      ) : null}

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <span>Composição</span>
          <h2>Pirâmide olfativa</h2>
          <p>Evolução da fragrância na pele.</p>
        </div>
        <OlfactoryPyramid notes={perfume.notes} />
      </section>

      <section className={`${styles.section} ${styles.performanceSection}`}>
        <div className={styles.sectionHeading}>
          <span>Comportamento</span>
          <h2>Perfil da fragrância</h2>
          <p>Desempenho e percepção sensorial.</p>
        </div>
        <div className={styles.profileColumns}>
          <div>
            <h3>Desempenho</h3>
            <PerformanceRadar scores={perfume.scores} />
          </div>
          <div>
            <h3>Perfil sensorial</h3>
            <ul className={styles.performanceBars} aria-label="Perfil sensorial">
              {profileMetrics.map(([label, key, Icon]) => {
                const value = perfume[key];
                const formatted = value === null ? "Não informado" : `${value}%`;

                return (
                  <li
                    key={key}
                    className={
                      value === null ? styles.performanceItemEmpty : styles.performanceItem
                    }
                  >
                    <Icon size={19} />
                    <div className={styles.performanceHeader}>
                      <span>
                        {label}: {formatted}
                      </span>
                    </div>
                    <span className={styles.performanceTrack} aria-hidden="true">
                      {value === null ? null : (
                        <span
                          className={styles.performanceFill}
                          style={{ width: `${value}%` }}
                        />
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <span>Quando usar</span>
          <h2>Ocasiões ideais</h2>
          <p>Melhores momentos para usar a fragrância.</p>
        </div>
        <SuitabilityGrid scores={perfume.scores} />
      </section>

    </article>
  );
}
