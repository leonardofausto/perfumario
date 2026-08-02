"use client";

import { ArrowLeft, LoaderCircle, Save } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useId, useMemo, useState } from "react";

import {
  createPerfumeAction,
  updatePerfumeAction,
  type PerfumeActionFields,
} from "@/features/perfumes/actions";
import {
  AUDIENCE_OPTIONS,
  CATEGORY_TYPE_OPTIONS,
  ENVIRONMENT_METRICS,
  OCCASION_METRICS,
  PERCENT_MAX,
  PERCENT_MIN,
  PERFORMANCE_METRICS,
  SEASON_METRICS,
  TIME_METRICS,
} from "@/features/perfumes/constants";
import type {
  Audience,
  CategoryType,
  Concentration,
  InspirationKind,
  NoteLayer,
  PerfumeDetail,
  PerfumeScore,
  ScoreCategory,
} from "@/features/perfumes/types";
import type { AutofillMetrics } from "@/features/perfume-autofill/types";
import type { ActionState } from "@/lib/auth/types";

import {
  PerfumeAutofill,
  type AutofillApplyValues,
  type AutofillFormValues,
} from "./perfume-autofill";
import styles from "./form.module.css";

type ScoreGroup = {
  category: Exclude<ScoreCategory, "accord">;
  title: string;
  metrics: ReadonlyArray<string>;
  labels: Record<string, string>;
};

const performanceGroup: ScoreGroup = {
  category: "performance",
  title: "Desempenho",
  metrics: PERFORMANCE_METRICS,
  labels: {
    fixacao: "Fixação",
    projecao: "Projeção",
    rastro: "Rastro",
    versatilidade: "Versatilidade",
    presenca: "Presença",
  },
};

const usageGroups: ScoreGroup[] = [
  {
    category: "season",
    title: "Estações",
    metrics: SEASON_METRICS,
    labels: {
      primavera: "Primavera",
      verao: "Verão",
      outono: "Outono",
      inverno: "Inverno",
    },
  },
  {
    category: "occasion",
    title: "Ocasiões",
    metrics: OCCASION_METRICS,
    labels: {
      ar_livre: "Academia",
      casual: "Casual",
      encontro: "Encontro",
      festa: "Festa",
      formal: "Formal",
      trabalho: "Trabalho",
    },
  },
  {
    category: "time",
    title: "Horários",
    metrics: TIME_METRICS,
    labels: {
      manha: "Manhã",
      tarde: "Tarde",
      noite: "Noite",
      madrugada: "Dia Inteiro",
    },
  },
  {
    category: "environment",
    title: "Ambiente",
    metrics: ENVIRONMENT_METRICS,
    labels: {
      ar_livre: "Ar livre",
      fechado: "Fechado",
    },
  },
];

const scoreGroups = [performanceGroup, ...usageGroups];

const noteLabels: Record<NoteLayer, string> = {
  top: "Notas de saída",
  heart: "Notas de coração",
  base: "Notas de fundo",
};

const noteLayerMeta: Record<NoteLayer, { step: string; hint: string }> = {
  top: { step: "Saída", hint: "Primeira impressão" },
  heart: { step: "Coração", hint: "Corpo da fragrância" },
  base: { step: "Fundo", hint: "Persistência na pele" },
};

const sensoryLabels = {
  intensity: "Intensidade",
  sweetness: "Docura",
  freshness: "Frescor",
  elegance: "Elegância",
  sensuality: "Sensualidade",
} as const;

type SensoryField = keyof typeof sensoryLabels;
type SensoryValues = Record<SensoryField, number | null>;

const sensoryOrder = Object.keys(sensoryLabels) as SensoryField[];

function list(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseAccords(value: string): PerfumeScore[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = "", rawScore = ""] = line.split(":");
      const scoreText = rawScore.trim();
      const scoreValue = Number(scoreText);

      return {
        category: "accord" as const,
        metricKey: name.trim(),
        score: scoreText && Number.isInteger(scoreValue) ? scoreValue : null,
      };
    })
    .filter((score) => score.metricKey);
}

function formatAccords(scores: PerfumeScore[]) {
  return scores
    .filter((score) => score.category === "accord")
    .map((score) => `${score.metricKey}: ${score.score ?? ""}`)
    .join("\n");
}

function sortAccords(scores: PerfumeScore[]) {
  return [...scores].sort((left, right) => (right.score ?? -1) - (left.score ?? -1));
}

function defaultScores(perfume?: PerfumeDetail) {
  return scoreGroups.flatMap(({ category, metrics }) =>
    metrics.map((metricKey) => ({
      category,
      metricKey,
      score:
        perfume?.scores.find(
          (score) => score.category === category && score.metricKey === metricKey,
        )?.score ?? null,
    })),
  );
}

function errorFor(state: ActionState<PerfumeActionFields>, field: keyof PerfumeActionFields) {
  return state.fieldErrors?.[field]?.[0];
}

function SectionTitle({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className={styles.sectionTitle}>
      <span>{step}</span>
      <div className={styles.sectionTitleText}>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function MetricLineField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  const inputId = useId();
  const safeValue =
    value === null ? null : Math.min(PERCENT_MAX, Math.max(PERCENT_MIN, value));
  const formatted = `${safeValue ?? 0}%`;

  return (
    <label className={styles.metricLine} htmlFor={inputId}>
      <span className={styles.metricLineName}>{label}</span>
      <span className={styles.metricLineTrack} aria-hidden="true">
        <span
          className={styles.metricLineFill}
          style={{ width: `${safeValue ?? 0}%` }}
        />
      </span>
      <span className={styles.metricLineValue}>
        <input
          id={inputId}
          name={name}
          type="number"
          inputMode="numeric"
          autoComplete="off"
          min={PERCENT_MIN}
          max={PERCENT_MAX}
          step={1}
          value={value ?? ""}
          aria-label={`${label} (%)`}
          placeholder={formatted}
          onChange={(event) => {
            const nextValue = event.target.value;
            onChange(nextValue === "" ? null : Number(nextValue));
          }}
        />
        <span className={styles.metricLineReadout} aria-hidden="true">
          {formatted}
        </span>
      </span>
    </label>
  );
}

function scoreValue(scores: PerfumeScore[], category: ScoreCategory, metricKey: string) {
  return (
    scores.find((score) => score.category === category && score.metricKey === metricKey)
      ?.score ?? null
  );
}

export function PerfumeForm({ perfume }: { perfume?: PerfumeDetail }) {
  const action = perfume
    ? updatePerfumeAction.bind(null, perfume.id)
    : createPerfumeAction;
  const [state, formAction, pending] = useActionState(action, {
    status: "idle",
  } satisfies ActionState<PerfumeActionFields>);
  const [brand, setBrand] = useState(perfume?.brand ?? "");
  const [name, setName] = useState(perfume?.name ?? "");
  const [description, setDescription] = useState(perfume?.description ?? "");
  const [concentration, setConcentration] = useState<Concentration>(
    perfume?.concentration ?? "unknown",
  );
  const [categoryType, setCategoryType] = useState<CategoryType | null>(
    (perfume?.categoryType as CategoryType | null) ?? null,
  );
  const [audience, setAudience] = useState<Audience | null>(
    (perfume?.audience as Audience | null) ?? null,
  );
  const [launchYear, setLaunchYear] = useState<number | null>(
    perfume?.launchYear ?? null,
  );
  const [inspirationKind, setInspirationKind] = useState<InspirationKind>(
    perfume?.inspirationKind ?? "original",
  );
  const [inspiredBy, setInspiredBy] = useState(perfume?.inspiredBy ?? "");
  const [olfactoryFamilies, setOlfactoryFamilies] = useState(
    perfume?.olfactoryFamilies ?? [],
  );
  const [sensoryValues, setSensoryValues] = useState<SensoryValues>({
    intensity: perfume?.intensity ?? null,
    sweetness: perfume?.sweetness ?? null,
    freshness: perfume?.freshness ?? null,
    elegance: perfume?.elegance ?? null,
    sensuality: perfume?.sensuality ?? null,
  });
  const [notes, setNotes] = useState<Record<NoteLayer, string>>({
    top: perfume?.notes.top.join(", ") ?? "",
    heart: perfume?.notes.heart.join(", ") ?? "",
    base: perfume?.notes.base.join(", ") ?? "",
  });
  const initialScores = useMemo(() => defaultScores(perfume), [perfume]);
  const [scores, setScores] = useState<PerfumeScore[]>(initialScores);
  const [accords, setAccords] = useState(formatAccords(perfume?.scores ?? []));
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
    };
  }, [coverPreviewUrl]);

  function setScore(category: ScoreCategory, metricKey: string, value: number | null) {
    setScores((current) =>
      current.map((score) =>
        score.category === category && score.metricKey === metricKey
          ? { ...score, score: value }
          : score,
      ),
    );
  }

  function setSensory(field: SensoryField, value: number | null) {
    setSensoryValues((current) => ({ ...current, [field]: value }));
  }

  function updateCoverPreview(file?: File) {
    setCoverPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return file ? URL.createObjectURL(file) : null;
    });
  }

  function currentMetrics(): AutofillMetrics {
    const metrics = Object.fromEntries(
      [
        ...PERFORMANCE_METRICS,
        ...SEASON_METRICS,
        ...OCCASION_METRICS,
        ...TIME_METRICS,
        ...ENVIRONMENT_METRICS,
      ].map((metricKey) => [
        metricKey,
        scores.find((score) => score.metricKey === metricKey)?.score ?? null,
      ]),
    ) as unknown as AutofillMetrics;

    for (const field of sensoryOrder) metrics[field] = sensoryValues[field];
    return metrics;
  }

  const autofillCurrent: AutofillFormValues = {
    name,
    brand,
    description,
    concentration,
    categoryType,
    audience,
    launchYear,
    inspirationKind,
    inspiredBy: inspiredBy || null,
    olfactoryFamilies,
    pyramid: notes,
    accords,
    metrics: currentMetrics(),
  };

  function applyAutofill(values: AutofillApplyValues) {
    if (values.name !== undefined) setName(values.name);
    if (values.brand !== undefined) setBrand(values.brand);
    if (values.description !== undefined) setDescription(values.description);
    if (values.concentration !== undefined) setConcentration(values.concentration);
    if (values.categoryType !== undefined) setCategoryType(values.categoryType);
    if (values.audience !== undefined) setAudience(values.audience);
    if (values.launchYear !== undefined) setLaunchYear(values.launchYear);
    if (values.olfactoryFamilies !== undefined) {
      setOlfactoryFamilies(values.olfactoryFamilies);
    }
    if (values.pyramid !== undefined) setNotes(values.pyramid);
    if (values.accords !== undefined) setAccords(values.accords);
    if (values.metrics !== undefined) {
      setScores((currentScores) =>
        currentScores.map((score) => ({
          ...score,
          score: values.metrics?.[score.metricKey as keyof AutofillMetrics] ?? null,
        })),
      );
      setSensoryValues((currentValues) =>
        Object.fromEntries(
          sensoryOrder.map((field) => [
            field,
            values.metrics?.[field] ?? currentValues[field],
          ]),
        ) as SensoryValues,
      );
    }
    if (values.inspirationKind !== undefined) {
      setInspirationKind(values.inspirationKind);
      setInspiredBy(
        values.inspirationKind === "original" ? "" : (values.inspiredBy ?? ""),
      );
    }
  }

  const backHref = perfume ? `/colecao/${perfume.id}` : "/colecao";
  const accordScores = sortAccords(parseAccords(accords));
  const formScores = [...scores, ...accordScores];
  const submitLabel = perfume ? "Salvar alterações" : "Adicionar perfume";

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <Link href={backHref} className={styles.backLink}>
          <ArrowLeft size={16} aria-hidden="true" />
          Voltar
        </Link>
      </div>

      <header className={styles.header}>
        <div>
          <span className={styles.topbarStatus}>
            {perfume ? "Editar cadastro" : "Novo cadastro"}
          </span>
          <h1>Fragrância</h1>
        </div>
      </header>

      <div className={styles.editShell}>
        <form action={formAction} className={styles.form}>
        <section id="identidade" className={styles.section}>
          <div className={styles.identityIntro}>
            <SectionTitle
              step="01"
              title="Identidade e apresentação"
              description="Dados principais da fragrância."
            />
            <label className={styles.identityCover}>
              <input
                className={styles.coverInput}
                type="file"
                name="image"
                accept="image/jpeg,image/png,image/avif,image/webp"
                aria-label="Imagem do perfume"
                onChange={(event) => updateCoverPreview(event.target.files?.[0])}
              />
              <span className={styles.identityCoverPreview}>
                {coverPreviewUrl ? (
                  <Image
                    src={coverPreviewUrl}
                    alt="Prévia da nova imagem selecionada"
                    fill
                    sizes="210px"
                    unoptimized
                  />
                ) : perfume?.imageUrl ? (
                  <Image
                    src={perfume.imageUrl}
                    alt={`Imagem atual de ${perfume.name}`}
                    fill
                    sizes="112px"
                    unoptimized
                  />
                ) : (
                  <span aria-hidden="true">{(perfume?.name ?? "P").slice(0, 1)}</span>
                )}
              </span>
              <span className={styles.identityCoverCopy}>
                <strong>Clique para mudar</strong>
                <small>JPG, PNG, AVIF ou WebP</small>
                <small>máximo de 5 MB.</small>
              </span>
            </label>
          </div>
          <div className={`${styles.fields} ${styles.identityGrid}`}>
            <label className={styles.identityBrand}>
              Marca
              <input
                name="brand"
                value={brand}
                autoComplete="off"
                onChange={(event) => setBrand(event.target.value)}
              />
              {errorFor(state, "brand") ? (
                <span className={styles.fieldError}>{errorFor(state, "brand")}</span>
              ) : null}
            </label>
            <label className={styles.identityName}>
              Nome do perfume
              <input
                name="name"
                value={name}
                autoComplete="off"
                onChange={(event) => setName(event.target.value)}
              />
              {errorFor(state, "name") ? (
                <span className={styles.fieldError}>{errorFor(state, "name")}</span>
              ) : null}
            </label>
            <PerfumeAutofill
              mode={perfume ? "edit" : "create"}
              query={{ name, ...(brand.trim() ? { brand } : {}) }}
              current={autofillCurrent}
              onApply={applyAutofill}
            />
            <label className={styles.selectField}>
              Concentração
              <select
                name="concentration"
                value={concentration}
                autoComplete="off"
                onChange={(event) =>
                  setConcentration(event.target.value as Concentration)
                }
              >
                <option value="unknown">Não informado</option>
                <option value="body_splash">Body Splash</option>
                <option value="eau_de_cologne">Eau de Cologne (EDC)</option>
                <option value="eau_de_parfum">Eau de Parfum (EDP)</option>
                <option value="eau_de_toilette">Eau de Toilette (EDT)</option>
                <option value="perfume_oil">Óleo Perfumado</option>
                <option value="parfum">Parfum</option>
              </select>
            </label>
            <label className={styles.selectField}>
              Categoria
              <select
                name="categoryType"
                value={categoryType ?? ""}
                autoComplete="off"
                onChange={(event) =>
                  setCategoryType((event.target.value || null) as CategoryType | null)
                }
              >
                <option value="">Não informado</option>
                {CATEGORY_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.selectField}>
              Relação com outra fragrância
              <select
                name="inspirationKind"
                value={inspirationKind}
                autoComplete="off"
                onChange={(event) =>
                  setInspirationKind(event.target.value as InspirationKind)
                }
              >
                <option value="original">Original</option>
                <option value="inspiration">Inspiração</option>
                <option value="dupe">Dupe</option>
              </select>
            </label>
            <label className={styles.referenceField}>
              Perfume de referência
              <input
                name="inspiredBy"
                value={inspiredBy}
                autoComplete="off"
                readOnly={inspirationKind === "original"}
                disabled={inspirationKind === "original"}
                aria-readonly={inspirationKind === "original"}
                aria-disabled={inspirationKind === "original"}
                onChange={(event) => setInspiredBy(event.target.value)}
              />
              {errorFor(state, "inspiredBy") ? (
                <span className={styles.fieldError}>{errorFor(state, "inspiredBy")}</span>
              ) : null}
            </label>
            <div className={`${styles.full} ${styles.identityMetaGroup}`}>
              <label className={styles.compactField}>
                Ano de lançamento
                <input
                  type="number"
                  name="launchYear"
                  inputMode="numeric"
                  autoComplete="off"
                  min={1800}
                  max={2200}
                  value={launchYear ?? ""}
                  onChange={(event) =>
                    setLaunchYear(
                      event.target.value === "" ? null : Number(event.target.value),
                    )
                  }
                />
              </label>
              <label className={styles.selectField}>
                Formato na estante
                <select
                  name="bottleFormat"
                  defaultValue={perfume?.bottleFormat ?? ""}
                  autoComplete="off"
                  required
                >
                  {!perfume ? (
                    <option value="" disabled>
                      Selecione o formato
                    </option>
                  ) : null}
                  <option value="decant">Decant</option>
                  <option value="full_bottle">Frasco</option>
                </select>
              </label>
              <label className={styles.selectField}>
                Público
                <select
                  name="audience"
                  value={audience ?? ""}
                  autoComplete="off"
                  onChange={(event) =>
                    setAudience((event.target.value || null) as Audience | null)
                  }
                >
                  <option value="">Não informado</option>
                  {AUDIENCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className={`${styles.full} ${styles.descriptionField}`}>
              Explicativo do perfume
              <textarea
                name="description"
                autoComplete="off"
                rows={4}
                value={description}
                required
                onChange={(event) => setDescription(event.target.value)}
              />
              {errorFor(state, "description") ? (
                <span className={styles.fieldError}>{errorFor(state, "description")}</span>
              ) : null}
            </label>
          </div>
        </section>

        <section
          id="descricao"
          className={`${styles.section} ${styles.fragranceSection}`}
          role="group"
          aria-label="Descrição da fragrância"
        >
          <SectionTitle
            step="02"
            title="Descrição da fragrância"
            description="Composição e acordes olfativos."
          />
          <div className={styles.fragranceContent}>
            <div className={styles.fragranceGroup}>
              <h3>Pirâmide olfativa</h3>
              <div className={styles.notePyramid} aria-label="Pirâmide olfativa">
                {(Object.keys(noteLabels) as NoteLayer[]).map((layer) => (
                  <label className={styles.noteLayer} key={layer}>
                    <span className={styles.noteLayerHeading}>
                      <strong>{noteLayerMeta[layer].step}</strong>
                      <small>{noteLayerMeta[layer].hint}</small>
                    </span>
                  <textarea
                    aria-label={noteLabels[layer]}
                    rows={5}
                    autoComplete="off"
                    value={notes[layer]}
                    onChange={(event) =>
                      setNotes((current) => ({ ...current, [layer]: event.target.value }))
                    }
                    required
                  />
                  </label>
                ))}
              </div>
            </div>
            <div className={styles.fragranceGroup}>
              <h3>Acordes principais</h3>
              <div className={styles.accordEditor}>
                <label>
                  <textarea
                    aria-label="Acordes principais"
                    rows={7}
                    autoComplete="off"
                    value={accords}
                    onChange={(event) => setAccords(event.target.value)}
                    placeholder={"citrico: 95\ncaramelo: 84\ndoce:"}
                  />
                  <small>
                    Use um acorde por linha no formato <strong>nome: intensidade</strong>.
                    Deixe a intensidade vazia quando não souber.
                  </small>
                </label>
              </div>
            </div>
            <input
              type="hidden"
              name="olfactoryFamilies"
              value={JSON.stringify(olfactoryFamilies)}
            />
            <input
              type="hidden"
              name="notes"
              value={JSON.stringify({
                top: list(notes.top),
                heart: list(notes.heart),
                base: list(notes.base),
              })}
            />
            <input type="hidden" name="scores" value={JSON.stringify(formScores)} />
          </div>
        </section>

        <section
          id="perfil"
          className={styles.section}
          role="group"
          aria-label="Perfil da fragrância"
        >
          <div className={styles.sectionTitle}>
            <span>04</span>
            <span>
              <strong>Perfil da fragrância</strong>
              <small>Desempenho e percepção sensorial.</small>
            </span>
          </div>
          <div className={styles.profileMetricColumns}>
            <section className={styles.metricLineGroup} role="group" aria-label="Desempenho">
              <h3>Desempenho</h3>
              <div className={styles.metricLineList}>
                {performanceGroup.metrics.map((metric) => (
                  <MetricLineField
                    key={metric}
                    label={performanceGroup.labels[metric]}
                    name={`${performanceGroup.category}-${metric}`}
                    value={scoreValue(scores, performanceGroup.category, metric)}
                    onChange={(value) => setScore(performanceGroup.category, metric, value)}
                  />
                ))}
              </div>
            </section>
            <section className={styles.metricLineGroup} role="group" aria-label="Perfil sensorial">
              <h3>Perfil sensorial</h3>
              <div className={styles.metricLineList}>
                {sensoryOrder.map((field) => (
                  <MetricLineField
                    key={field}
                    label={sensoryLabels[field]}
                    name={field}
                    value={sensoryValues[field]}
                    onChange={(value) => setSensory(field, value)}
                  />
                ))}
              </div>
              <input type="hidden" name="profileTags" value="[]" />
            </section>
          </div>
        </section>

        <section id="uso" className={styles.section} role="group" aria-label="Quando usar">
          <div className={styles.sectionTitle}>
            <span>05</span>
            <span>
              <strong>Quando usar</strong>
              <small>Ocasiões, clima, horários e ambientes ideais.</small>
            </span>
          </div>
          <div className={styles.usageColumns}>
            {[usageGroups.slice(0, 2), usageGroups.slice(2)].map((column, index) => (
              <div className={styles.usageColumn} key={index === 0 ? "contexto" : "momento"}>
                {column.map((group) => (
                  <section
                    key={group.category}
                    className={styles.usageGroup}
                    role="group"
                    aria-label={group.title}
                  >
                    <h3>{group.title}</h3>
                    <div className={styles.usageMetricList}>
                      {group.metrics.map((metric) => (
                        <MetricLineField
                          key={metric}
                          label={group.labels[metric]}
                          name={`${group.category}-${metric}`}
                          value={scoreValue(scores, group.category, metric)}
                          onChange={(value) => setScore(group.category, metric, value)}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ))}
          </div>
        </section>

        <p className={styles.formMessage} role="status" aria-live="polite">
          {pending ? "Salvando ficha…" : state.message}
        </p>

        <div className={styles.footer}>
          <Link href={backHref} className={styles.cancelAction}>
            Cancelar
          </Link>
          <button type="submit" disabled={pending} aria-busy={pending}>
            {pending ? (
              <LoaderCircle className={styles.spinner} size={17} aria-hidden="true" />
            ) : (
              <Save size={17} aria-hidden="true" />
            )}
            {pending ? "Salvando…" : submitLabel}
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}
