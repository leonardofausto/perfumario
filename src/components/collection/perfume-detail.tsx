import { ArrowLeft, Candy, Droplets, Flame, Gem, Heart, Wind } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { PerfumeDetail as PerfumeDetailData } from "@/features/perfumes/types";

import styles from "./detail.module.css";
import { MainAccords } from "./main-accords";
import { OlfactoryFamilyChips } from "./olfactory-family-chips";
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

export function PerfumeDetail({ perfume }: { perfume: PerfumeDetailData }) {
  const relationLabel =
    perfume.inspirationKind === "original"
      ? "Original"
      : perfume.inspirationKind === "dupe"
        ? "Dupe"
        : "Inspiração";

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
          <p className={styles.description}>{perfume.description}</p>
          <OlfactoryFamilyChips families={perfume.olfactoryFamilies} />
          <dl className={styles.essentialMeta} aria-label="Informações essenciais">
            <div>
              <dt>Concentração</dt>
              <dd>{concentrationLabels[perfume.concentration]}</dd>
            </div>
            {perfume.categoryType ? (
              <div>
                <dt>Categoria</dt>
                <dd>{categoryLabels[perfume.categoryType] ?? perfume.categoryType}</dd>
              </div>
            ) : null}
            <div>
              <dt>Relação</dt>
              <dd>{relationLabel}</dd>
            </div>
            <div>
              <dt>Perfume de referência</dt>
              <dd>
                {perfume.inspirationKind === "original"
                  ? "Não se aplica"
                  : perfume.inspiredBy}
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
            <p>As facetas mais perceptíveis da fragrância, em ordem de presença.</p>
          </div>
          <MainAccords scores={perfume.scores} />
        </section>
      ) : null}

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
          <h2>Perfil da fragrância</h2>
          <p>Indicadores de desempenho e percepção sensorial.</p>
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
          <p>Clima, ocasiões, horários e ambientes onde a fragrância se destaca.</p>
        </div>
        <SuitabilityGrid scores={perfume.scores} />
      </section>

      <section className={`${styles.section} ${styles.technicalSection}`}>
        <div className={styles.sectionHeading}>
          <span>Registro</span>
          <h2>Informações técnicas</h2>
          <p>Dados complementares para consulta da fragrância.</p>
        </div>
        <dl className={styles.technicalList}>
          <div>
            <dt>Ano de lançamento</dt>
            <dd>{perfume.launchYear ?? "Não informado"}</dd>
          </div>
          <div>
            <dt>Público</dt>
            <dd>
              {perfume.audience
                ? audienceLabels[perfume.audience] ?? perfume.audience
                : "Não informado"}
            </dd>
          </div>
          <div>
            <dt>Formato na estante</dt>
            <dd>{perfume.bottleFormat === "decant" ? "Decant" : "Frasco"}</dd>
          </div>
        </dl>
      </section>
    </article>
  );
}
