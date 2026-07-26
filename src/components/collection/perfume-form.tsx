"use client";

import { ArrowLeft, ImageUp, Save } from "lucide-react";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import {
  createPerfumeAction,
  updatePerfumeAction,
  type PerfumeActionFields,
} from "@/features/perfumes/actions";
import {
  OCCASION_METRICS,
  PERFORMANCE_METRICS,
  SEASON_METRICS,
  TIME_METRICS,
} from "@/features/perfumes/constants";
import type {
  InspirationKind,
  NoteLayer,
  PerfumeDetail,
  PerfumeScore,
  ScoreCategory,
} from "@/features/perfumes/types";
import type { ActionState } from "@/lib/auth/types";

import styles from "./form.module.css";

type ScoreGroup = {
  category: ScoreCategory;
  title: string;
  metrics: ReadonlyArray<string>;
  labels: Record<string, string>;
};

const scoreGroups: ScoreGroup[] = [
  {
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
  },
  {
    category: "season",
    title: "Clima e estações",
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
      trabalho: "Trabalho",
      casual: "Casual",
      encontro: "Encontro",
      formal: "Formal",
      festa: "Festa",
      ar_livre: "Ar livre",
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
      madrugada: "Madrugada",
    },
  },
];

const noteLabels: Record<NoteLayer, string> = {
  top: "Notas de saída",
  heart: "Notas de coração",
  base: "Notas de fundo",
};

function list(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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
  const message = state.fieldErrors?.[field]?.[0];
  return message ? <span className={styles.fieldError}>{message}</span> : null;
}

export function PerfumeForm({ perfume }: { perfume?: PerfumeDetail }) {
  const action = perfume
    ? updatePerfumeAction.bind(null, perfume.id)
    : createPerfumeAction;
  const [state, formAction, pending] = useActionState(action, {
    status: "idle",
  } satisfies ActionState<PerfumeActionFields>);
  const [inspirationKind, setInspirationKind] = useState<InspirationKind>(
    perfume?.inspirationKind ?? "original",
  );
  const [families, setFamilies] = useState(perfume?.olfactoryFamilies.join(", ") ?? "");
  const [notes, setNotes] = useState<Record<NoteLayer, string>>({
    top: perfume?.notes.top.join(", ") ?? "",
    heart: perfume?.notes.heart.join(", ") ?? "",
    base: perfume?.notes.base.join(", ") ?? "",
  });
  const initialScores = useMemo(() => defaultScores(perfume), [perfume]);
  const [scores, setScores] = useState<PerfumeScore[]>(initialScores);

  function setScore(category: ScoreCategory, metricKey: string, value: string) {
    setScores((current) =>
      current.map((score) =>
        score.category === category && score.metricKey === metricKey
          ? { ...score, score: value === "" ? null : Number(value) }
          : score,
      ),
    );
  }

  const backHref = perfume ? `/colecao/${perfume.id}` : "/colecao";

  return (
    <div className={styles.page}>
      <Link href={backHref} className={styles.backLink}>
        <ArrowLeft size={17} />
        Voltar
      </Link>

      <header className={styles.header}>
        <span>{perfume ? "Atualizar registro" : "Nova fragrância"}</span>
        <h1>{perfume ? `Editar ${perfume.name}` : "Adicionar perfume"}</h1>
        <p>Registre somente o que você conhece; campos percentuais podem ficar vazios.</p>
      </header>

      <form action={formAction} className={styles.form}>
        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <span>01</span>
            <div>
              <h2>Identidade</h2>
              <p>Nome, formato e relação com outras fragrâncias.</p>
            </div>
          </div>
          <div className={styles.fields}>
            <label>
              Marca
              <input name="brand" defaultValue={perfume?.brand ?? ""} required />
              {errorFor(state, "brand")}
            </label>
            <label>
              Nome do perfume
              <input name="name" defaultValue={perfume?.name ?? ""} required />
              {errorFor(state, "name")}
            </label>
            <label>
              Concentração
              <select
                name="concentration"
                defaultValue={perfume?.concentration ?? "eau_de_parfum"}
              >
                <option value="parfum">Parfum</option>
                <option value="eau_de_parfum">Eau de parfum</option>
                <option value="eau_de_toilette">Eau de toilette</option>
                <option value="eau_de_cologne">Eau de cologne</option>
                <option value="body_splash">Body splash</option>
                <option value="perfume_oil">Óleo perfumado</option>
                <option value="other">Outra</option>
              </select>
            </label>
            <label>
              Formato na estante
              <select
                name="bottleFormat"
                defaultValue={perfume?.bottleFormat ?? "full_bottle"}
              >
                <option value="full_bottle">Frasco inteiro</option>
                <option value="decant">Decant</option>
              </select>
            </label>
            <label>
              Relação com outra fragrância
              <select
                name="inspirationKind"
                value={inspirationKind}
                onChange={(event) =>
                  setInspirationKind(event.target.value as InspirationKind)
                }
              >
                <option value="original">Original</option>
                <option value="inspiration">Inspiração</option>
                <option value="dupe">Dupe</option>
              </select>
            </label>
            {inspirationKind !== "original" ? (
              <label>
                Perfume de referência
                <input
                  name="inspiredBy"
                  defaultValue={perfume?.inspiredBy ?? ""}
                  required
                />
                {errorFor(state, "inspiredBy")}
              </label>
            ) : (
              <input type="hidden" name="inspiredBy" value="" />
            )}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <span>02</span>
            <div>
              <h2>Explicação e famílias</h2>
              <p>O texto que aparecerá no detalhe da fragrância.</p>
            </div>
          </div>
          <div className={styles.fields}>
            <label className={styles.full}>
              Explicativo do perfume
              <textarea
                name="description"
                rows={5}
                defaultValue={perfume?.description ?? ""}
                required
              />
              {errorFor(state, "description")}
            </label>
            <label className={styles.full}>
              Famílias olfativas
              <input
                value={families}
                onChange={(event) => setFamilies(event.target.value)}
                placeholder="Amadeirado, especiado"
                required
              />
              <small>Separe as famílias com vírgulas.</small>
            </label>
            <input type="hidden" name="olfactoryFamilies" value={JSON.stringify(list(families))} />
          </div>
        </section>

        <fieldset className={styles.section} aria-label="Pirâmide olfativa">
          <legend className={styles.sectionTitle}>
            <span>03</span>
            <span>
              <strong>Pirâmide olfativa</strong>
              <small>Separe cada nota com vírgulas.</small>
            </span>
          </legend>
          <div className={styles.fields}>
            {(Object.keys(noteLabels) as NoteLayer[]).map((layer) => (
              <label key={layer}>
                {noteLabels[layer]}
                <textarea
                  rows={3}
                  value={notes[layer]}
                  onChange={(event) =>
                    setNotes((current) => ({ ...current, [layer]: event.target.value }))
                  }
                  required
                />
              </label>
            ))}
            <input
              type="hidden"
              name="notes"
              value={JSON.stringify({
                top: list(notes.top),
                heart: list(notes.heart),
                base: list(notes.base),
              })}
            />
          </div>
        </fieldset>

        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <span>04</span>
            <div>
              <h2>Leitura de uso</h2>
              <p>Use percentuais de 0 a 100 ou deixe sem informar.</p>
            </div>
          </div>
          <div className={styles.scoreGroups}>
            {scoreGroups.map((group) => (
              <fieldset key={group.category} aria-label={group.title}>
                <legend>{group.title}</legend>
                <div className={styles.scoreGrid}>
                  {group.metrics.map((metric) => {
                    const score = scores.find(
                      (item) =>
                        item.category === group.category && item.metricKey === metric,
                    );
                    return (
                      <label key={metric}>
                        {group.labels[metric]} (%)
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={score?.score ?? ""}
                          onChange={(event) =>
                            setScore(group.category, metric, event.target.value)
                          }
                        />
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
            <input type="hidden" name="scores" value={JSON.stringify(scores)} />
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <ImageUp size={21} />
            <div>
              <h2>Imagem</h2>
              <p>Capa privada armazenada no Supabase.</p>
            </div>
          </div>
          <label className={styles.upload}>
            Imagem do perfume
            <input
              type="file"
              name="image"
              accept="image/webp"
              aria-label="Imagem do perfume"
            />
            <small>WebP, até 5 MB. A imagem atual será mantida se nenhuma for escolhida.</small>
          </label>
        </section>

        {state.message ? (
          <p className={styles.formMessage} role="status">
            {state.message}
          </p>
        ) : null}

        <div className={styles.footer}>
          <Link href={backHref}>Cancelar</Link>
          <button type="submit" disabled={pending}>
            <Save size={17} />
            {pending ? "Salvando..." : perfume ? "Salvar alterações" : "Adicionar perfume"}
          </button>
        </div>
      </form>
    </div>
  );
}
