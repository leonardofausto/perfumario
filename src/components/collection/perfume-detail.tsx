import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Candy,
  Clock3,
  Droplets,
  Flame,
  Gem,
  Heart,
  Link as LinkIcon,
  MessageCircle,
  Moon,
  Sparkle,
  Sparkles,
  Star,
  Tags,
  Users,
  Wind,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { JourneyRegisterButton } from "@/components/journey/journey-register-button";
import type { JourneyPerfumeSummary } from "@/features/journey/types";
import type { PerfumeDetail as PerfumeDetailData, PerfumeSummary } from "@/features/perfumes/types";

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

const occasionLabels: Record<string, string> = {
  ar_livre: "Ar livre",
  casual: "Casual",
  encontro: "Encontro",
  festa: "Festa",
  formal: "Formal",
  outdoor: "Ar livre",
  trabalho: "Trabalho",
};

const momentLabels: Record<string, string> = {
  madrugada: "Madrugada",
  manha: "Manhã",
  noite: "Noite",
  tarde: "Tarde",
};

function formatJourneyDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(value))
    : "Não informado";
}

function formatDaysAgo(value: string | null) {
  if (!value) return null;
  const elapsed = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(elapsed) || elapsed < 0) return null;
  const days = Math.ceil(elapsed / 86400000);
  if (days === 0) return "Hoje";
  if (days === 1) return "Há 1 dia";
  return `Há ${days} dias`;
}

function formatSatisfaction(value: number | null) {
  return value === null ? "Sem avaliação" : `${value.toFixed(1).replace(".", ",")}/5`;
}

function percentageFor(count: number | undefined, total: number) {
  return count && total > 0 ? Math.round((count / total) * 100) : null;
}

export function PerfumeDetail({
  perfume,
  journeySummary,
  perfumes,
  backHref = "/colecao",
  backLabel = "Voltar para a cole\u00e7\u00e3o",
}: {
  perfume: PerfumeDetailData;
  journeySummary?: JourneyPerfumeSummary;
  perfumes?: PerfumeSummary[];
  backHref?: string;
  backLabel?: string;
}) {
  const journey = journeySummary ?? {
    usageCount: 0,
    lastUsedAt: null,
    averageSatisfaction: null,
    complimentsCount: 0,
    frequentOccasion: null,
    occasionCounts: {},
    favoriteMoment: null,
    momentCounts: {},
  };
  const journeyPerfumes = perfumes ?? [];
  const lastUsedRelative = formatDaysAgo(journey.lastUsedAt);
  const frequentOccasionPercent = journey.frequentOccasion
    ? percentageFor(journey.occasionCounts[journey.frequentOccasion], journey.usageCount)
    : null;
  const favoriteMomentPercent = journey.favoriteMoment
    ? percentageFor(journey.momentCounts[journey.favoriteMoment], journey.usageCount)
    : null;
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
              priority
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

      <section className={styles.journeySection} aria-labelledby="journey-summary-title">
        <div className={styles.sectionHeading}>
          <span>MEMÓRIA OLFATIVA</span>
          <h2 id="journey-summary-title">Sua jornada</h2>
          <p>{journey.usageCount > 0 ? "O que seus usos reais contam sobre esta fragrância." : "Registre o primeiro uso para construir esta memória."}</p>
          {journey.usageCount > 0 ? (
            <Link className={styles.journeyLink} href={`/jornada?q=${encodeURIComponent(perfume.name)}`}>Ver na Jornada</Link>
          ) : null}
        </div>
        {journey.usageCount > 0 ? (
          <div className={styles.journeyContent} aria-label="Resumo da jornada desta fragrância">
            <dl className={styles.journeyMetricGrid}>
              <div className={styles.journeyMetricCard}>
                <dt><BarChart3 size={18} aria-hidden="true" />USOS REGISTRADOS</dt>
                <dd>{journey.usageCount}</dd>
              </div>
              <div className={styles.journeyMetricCard}>
                <dt><Calendar size={18} aria-hidden="true" />ÚLTIMO USO</dt>
                <dd>{formatJourneyDate(journey.lastUsedAt)}</dd>
                {lastUsedRelative ? <span>{lastUsedRelative}</span> : null}
              </div>
              <div className={styles.journeyMetricCard}>
                <dt><Star size={18} aria-hidden="true" />SATISFAÇÃO MÉDIA</dt>
                <dd>{formatSatisfaction(journey.averageSatisfaction)}</dd>
                <span
                  className={styles.satisfactionStars}
                  aria-label={
                    journey.averageSatisfaction === null
                      ? "Satisfação média ainda sem dados"
                      : `Satisfação média: ${journey.averageSatisfaction.toFixed(1).replace(".", ",")} de 5`
                  }
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={13}
                      aria-hidden="true"
                      fill={
                        journey.averageSatisfaction !== null && journey.averageSatisfaction >= star
                          ? "currentColor"
                          : "none"
                      }
                    />
                  ))}
                </span>
              </div>
              <div className={styles.journeyMetricCard}>
                <dt><MessageCircle size={18} aria-hidden="true" />ELOGIOS RECEBIDOS</dt>
                <dd>{journey.complimentsCount}</dd>
                <span>Total</span>
              </div>
            </dl>
            <dl className={styles.journeyPreferenceGrid}>
              <div className={styles.journeyPreferenceCard}>
                <dt><Sparkle size={18} aria-hidden="true" />OCASIÃO MAIS FREQUENTE</dt>
                <dd>{journey.frequentOccasion ? occasionLabels[journey.frequentOccasion] ?? journey.frequentOccasion : "Ainda sem dados"}</dd>
                {frequentOccasionPercent === null ? null : (
                  <>
                    <span className={styles.preferenceTrack} aria-hidden="true">
                      <span style={{ width: `${frequentOccasionPercent}%` }} />
                    </span>
                    <span className={styles.preferencePercent}>{frequentOccasionPercent}%</span>
                  </>
                )}
              </div>
              <div className={styles.journeyPreferenceCard}>
                <dt><Clock3 size={18} aria-hidden="true" />MOMENTO FAVORITO</dt>
                <dd>{journey.favoriteMoment ? momentLabels[journey.favoriteMoment] : "Ainda sem dados"}</dd>
                {favoriteMomentPercent === null ? null : (
                  <>
                    <span className={styles.preferenceTrack} aria-hidden="true">
                      <span style={{ width: `${favoriteMomentPercent}%` }} />
                    </span>
                    <span className={styles.preferencePercent}>{favoriteMomentPercent}%</span>
                  </>
                )}
              </div>
            </dl>
            <div className={styles.journeyInsight}>
              <Moon size={17} aria-hidden="true" />
              <p>Continue registrando seus usos para revelar ainda mais insights sobre seus hábitos e preferências.</p>
            </div>
          </div>
        ) : (
          <div className={styles.journeyEmpty}>
            <JourneyRegisterButton initialPerfumeId={perfume.id} perfumes={journeyPerfumes} empty />
          </div>
        )}
      </section>

    </article>
  );
}
