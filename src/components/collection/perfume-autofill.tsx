"use client";

import { Check, CircleAlert, LoaderCircle, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { autofillResponseSchema } from "@/features/perfume-autofill/schema";
import type {
  AutofillFieldOrigin,
  AutofillFields,
  AutofillMetrics,
  AutofillResponse,
} from "@/features/perfume-autofill/types";
import type {
  Audience,
  CategoryType,
  Concentration,
  InspirationKind,
} from "@/features/perfumes/types";

import styles from "./perfume-autofill.module.css";

export interface AutofillFormValues {
  name: string;
  brand: string;
  description: string;
  concentration: Concentration;
  categoryType: CategoryType | null;
  audience: Audience | null;
  launchYear: number | null;
  inspirationKind: InspirationKind;
  inspiredBy: string | null;
  olfactoryFamilies: string[];
  pyramid: { top: string; heart: string; base: string };
  accords: string;
  metrics: AutofillMetrics;
}

export type AutofillApplyValues = Partial<AutofillFormValues>;

type PreviewKey =
  | Exclude<keyof AutofillFields, "inspirationKind" | "inspiredBy">
  | "relation";

type Phase = "idle" | "searching" | "sources" | "consolidating";

const fieldLabels: Record<PreviewKey, string> = {
  name: "Nome",
  brand: "Marca",
  description: "Descrição",
  concentration: "Concentração",
  categoryType: "Categoria",
  audience: "Público",
  launchYear: "Ano de lançamento",
  relation: "Relação e referência",
  olfactoryFamilies: "Famílias olfativas",
  pyramid: "Pirâmide olfativa",
  accords: "Acordes principais",
  metrics: "Scores",
};

const originLabels: Record<AutofillFieldOrigin, string> = {
  official: "Fonte oficial",
  specialized: "Base especializada",
  technical: "Ficha técnica",
  community: "Comunidade",
  inference: "Inferência",
  unavailable: "Não encontrado",
};

const phaseCopy: Record<Phase, string> = {
  idle: "Informe o nome para pesquisar. A marca é opcional.",
  searching: "Pesquisando fragrância…",
  sources: "Consultando fontes…",
  consolidating: "Consolidando informações…",
};

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
}

function stable(value: unknown): string {
  if (typeof value === "string") return normalizeText(value);
  if (Array.isArray(value)) return JSON.stringify(value.map(stable).sort());
  if (value && typeof value === "object") {
    return JSON.stringify(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, stable(item)]),
    );
  }
  return JSON.stringify(value);
}

function resultValue(result: AutofillResponse, key: PreviewKey) {
  if (key === "relation") {
    return {
      inspirationKind: result.fields.inspirationKind.value,
      inspiredBy: result.fields.inspiredBy.value,
    };
  }
  return result.fields[key].value;
}

function currentValue(current: AutofillFormValues, key: PreviewKey) {
  if (key === "relation") {
    return {
      inspirationKind: current.inspirationKind,
      inspiredBy: current.inspiredBy,
    };
  }
  return current[key];
}

function metaFor(result: AutofillResponse, key: PreviewKey) {
  if (key === "relation") return result.fields.inspirationKind;
  return result.fields[key];
}

function availableKeys(result: AutofillResponse) {
  return (Object.keys(fieldLabels) as PreviewKey[]).filter((key) => {
    if (key === "relation") {
      const kind = result.fields.inspirationKind.value;
      return (
        kind === "original" ||
        ((kind === "inspiration" || kind === "dupe") &&
          Boolean(result.fields.inspiredBy.value))
      );
    }
    return result.fields[key].value !== null;
  });
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Não encontrado";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") {
    const relation = value as {
      inspirationKind?: InspirationKind | null;
      inspiredBy?: string | null;
    };
    if (relation.inspirationKind) {
      const relationLabel = {
        original: "Original",
        inspiration: "Inspiração",
        dupe: "Dupe",
      }[relation.inspirationKind];
      return relation.inspiredBy
        ? `${relationLabel} · ${relation.inspiredBy}`
        : relationLabel;
    }
    return Object.entries(value)
      .filter(([, item]) => item !== null && item !== "")
      .map(([key, item]) => `${key}: ${String(item)}`)
      .join(" · ");
  }
  return String(value);
}

function selectedValues(result: AutofillResponse, keys: PreviewKey[]) {
  const values: AutofillApplyValues = {};
  for (const key of keys) {
    if (key === "relation") {
      const inspirationKind = result.fields.inspirationKind.value;
      if (!inspirationKind) continue;
      values.inspirationKind = inspirationKind;
      values.inspiredBy =
        inspirationKind === "original" ? null : result.fields.inspiredBy.value;
      continue;
    }
    const value = result.fields[key].value;
    if (value !== null) {
      Object.assign(values, { [key]: value });
    }
  }
  return values;
}

function responseError(status: number, code?: string) {
  if (status === 404 || code === "not_found") {
    return { kind: "not-found" as const, message: "Fragrância não encontrada." };
  }
  if (status === 429 || code === "rate_limited") {
    return {
      kind: "error" as const,
      message: "Limite de pesquisas atingido. Tente novamente mais tarde.",
    };
  }
  if (status === 504 || code === "timeout") {
    return {
      kind: "error" as const,
      message: "A pesquisa demorou demais. Tente novamente.",
    };
  }
  return {
    kind: "error" as const,
    message: "Não foi possível concluir a pesquisa.",
  };
}

export function PerfumeAutofill({
  mode,
  query,
  current,
  onApply,
}: {
  mode: "create" | "edit";
  query: { name: string; brand?: string };
  current: AutofillFormValues;
  onApply: (values: AutofillApplyValues) => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<AutofillResponse | null>(null);
  const [resultStatus, setResultStatus] = useState<"success" | "partial">("success");
  const [feedback, setFeedback] = useState<{
    kind: "not-found" | "error" | "cancelled";
    message: string;
  } | null>(null);
  const [selected, setSelected] = useState<Set<PreviewKey>>(new Set());
  const requestRef = useRef<AbortController | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const allAvailable = useMemo(
    () => (result ? availableKeys(result) : []),
    [result],
  );
  const visibleKeys = useMemo(() => {
    if (!result) return [];
    if (mode === "create") return allAvailable;
    return allAvailable.filter(
      (key) => stable(currentValue(current, key)) !== stable(resultValue(result, key)),
    );
  }, [allAvailable, current, mode, result]);

  useEffect(() => {
    return () => {
      requestRef.current?.abort();
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  function clearProgressTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  async function search() {
    const name = query.name.trim();
    const brand = query.brand?.trim();
    if (!name) {
      setFeedback({ kind: "error", message: "Informe o nome da fragrância." });
      return;
    }

    requestRef.current?.abort();
    clearProgressTimers();
    const controller = new AbortController();
    requestRef.current = controller;
    setResult(null);
    setFeedback(null);
    setSelected(new Set());
    setPhase("searching");
    timersRef.current = [
      setTimeout(() => setPhase("sources"), 350),
      setTimeout(() => setPhase("consolidating"), 900),
    ];

    try {
      const response = await fetch("/api/perfumes/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          ...(brand ? { brand } : {}),
          ignoreCache: false,
        }),
        signal: controller.signal,
      });
      const body = (await response.json()) as {
        status?: "success" | "partial";
        result?: unknown;
        error?: { code?: string };
      };
      if (!response.ok) {
        setFeedback(responseError(response.status, body.error?.code));
        return;
      }
      const parsed = autofillResponseSchema.safeParse(body.result);
      if (!parsed.success || (body.status !== "success" && body.status !== "partial")) {
        setFeedback({
          kind: "error",
          message: "O resultado recebido não pôde ser validado.",
        });
        return;
      }
      setResultStatus(body.status);
      setResult(parsed.data as AutofillResponse);
    } catch {
      if (controller.signal.aborted) {
        setFeedback({ kind: "cancelled", message: "Pesquisa cancelada." });
      } else {
        setFeedback({
          kind: "error",
          message: "Não foi possível conectar à pesquisa.",
        });
      }
    } finally {
      clearProgressTimers();
      if (requestRef.current === controller) requestRef.current = null;
      setPhase("idle");
    }
  }

  function cancel() {
    requestRef.current?.abort();
    clearProgressTimers();
    setResult(null);
    setPhase("idle");
    setFeedback({ kind: "cancelled", message: "Pesquisa cancelada." });
  }

  function apply() {
    if (!result) return;
    const keys = mode === "create" ? visibleKeys : [...selected];
    onApply(selectedValues(result, keys));
    setFeedback(null);
    setResult(null);
    setSelected(new Set());
  }

  const isLoading = phase !== "idle";
  const sourceCount = result?.sources.length ?? 0;
  const foundCount = result ? allAvailable.length : 0;
  const inferredCount = result
    ? allAvailable.filter((key) => metaFor(result, key).inferred).length
    : 0;
  const conflictCount = result
    ? allAvailable.filter((key) => metaFor(result, key).conflicts.length > 0).length
    : 0;
  const missingCount = result
    ? Object.keys(fieldLabels).length - foundCount
    : 0;

  return (
    <section className={styles.panel} aria-label="Pesquisa de dados da fragrância">
      <div className={styles.heading}>
        <div>
          <span>Pesquisa assistida</span>
          <h3>Complete com fontes verificáveis</h3>
        </div>
        <button
          type="button"
          className={styles.searchButton}
          onClick={search}
          disabled={isLoading || !query.name.trim()}
        >
          {isLoading ? (
            <LoaderCircle className={styles.spinner} size={16} aria-hidden="true" />
          ) : (
            <Search size={16} aria-hidden="true" />
          )}
          Buscar dados
        </button>
      </div>

      {isLoading ? (
        <div className={styles.progress} role="status" aria-live="polite">
          <LoaderCircle className={styles.spinner} size={18} aria-hidden="true" />
          <span>{phaseCopy[phase]}</span>
          <button type="button" onClick={cancel}>
            Cancelar
          </button>
        </div>
      ) : !result && !feedback ? (
        <p className={styles.hint}>{phaseCopy.idle}</p>
      ) : null}

      {feedback ? (
        <div
          className={feedback.kind === "error" ? styles.error : styles.feedback}
          role="status"
          aria-live="polite"
        >
          <CircleAlert size={17} aria-hidden="true" />
          <span>{feedback.message}</span>
        </div>
      ) : null}

      {result ? (
        <div className={styles.preview}>
          <div className={styles.resultHeader}>
            <div>
              <span className={styles.status}>
                {resultStatus === "partial" ? "Resultado parcial" : "Resultado encontrado"}
              </span>
              <strong>
                {result.fields.brand.value
                  ? `${result.fields.brand.value} · `
                  : ""}
                {result.fields.name.value ?? result.query.name}
              </strong>
            </div>
            <span className={styles.confidence}>
              {Math.round(result.confidence * 100)}% de confiança
            </span>
          </div>

          <dl className={styles.summary} aria-label="Resumo da pesquisa">
            <div><dt>Fontes</dt><dd>{sourceCount}</dd></div>
            <div><dt>Encontrados</dt><dd>{foundCount}</dd></div>
            <div><dt>Inferidos</dt><dd>{inferredCount}</dd></div>
            <div><dt>Divergentes</dt><dd>{conflictCount}</dd></div>
            <div><dt>Ausentes</dt><dd>{missingCount}</dd></div>
          </dl>

          {mode === "edit" && visibleKeys.length > 0 ? (
            <div className={styles.selectionActions}>
              <button type="button" onClick={() => setSelected(new Set(visibleKeys))}>
                Selecionar tudo
              </button>
              <button type="button" onClick={() => setSelected(new Set())}>
                Desmarcar tudo
              </button>
            </div>
          ) : null}

          {visibleKeys.length > 0 ? (
            <ul className={styles.fieldList} aria-label="Dados encontrados">
              {visibleKeys.map((key) => {
                const meta = metaFor(result, key);
                const value = resultValue(result, key);
                const item = (
                  <>
                    <span className={styles.fieldTopline}>
                      <strong>{fieldLabels[key]}</strong>
                      <span>{Math.round(meta.confidence * 100)}%</span>
                    </span>
                    {mode === "edit" ? (
                      <span className={styles.comparison}>
                        <small>Atual</small>
                        <span>{displayValue(currentValue(current, key))}</span>
                        <small>Encontrado</small>
                        <span>{displayValue(value)}</span>
                      </span>
                    ) : (
                      <span className={styles.value}>{displayValue(value)}</span>
                    )}
                    <span className={styles.meta}>
                      {originLabels[meta.origin]}
                      {meta.inferred ? " · Inferido" : ""}
                      {meta.conflicts.length > 0
                        ? ` · ${meta.conflicts.length} divergência(s)`
                        : ""}
                    </span>
                  </>
                );

                return (
                  <li key={key}>
                    {mode === "edit" ? (
                      <label>
                        <input
                          type="checkbox"
                          checked={selected.has(key)}
                          onChange={(event) =>
                            setSelected((currentSelection) => {
                              const next = new Set(currentSelection);
                              if (event.target.checked) next.add(key);
                              else next.delete(key);
                              return next;
                            })
                          }
                        />
                        <span>{item}</span>
                      </label>
                    ) : item}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={styles.noDifferences}>
              {mode === "edit"
                ? "Nenhuma diferença relevante foi encontrada."
                : "Nenhum campo aplicável foi encontrado."}
            </p>
          )}

          {result.warnings.length > 0 ? (
            <div className={styles.warnings}>
              <strong>Avisos para revisão</strong>
              <ul>
                {result.warnings.map((warning, index) => (
                  <li key={`${warning.code}-${index}`}>{warning.message}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className={styles.sources}>
            <strong>Fontes consultadas</strong>
            <ul>
              {result.sources.map((source) => (
                <li key={source.id}>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.dismiss} onClick={cancel}>
              <X size={15} aria-hidden="true" />
              Cancelar
            </button>
            <button
              type="button"
              className={styles.apply}
              onClick={apply}
              disabled={mode === "edit" && selected.size === 0}
            >
              <Check size={15} aria-hidden="true" />
              {mode === "edit" ? "Aplicar selecionados" : "Aplicar ao cadastro"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
