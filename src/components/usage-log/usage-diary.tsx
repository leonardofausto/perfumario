"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  CloudSun,
  Edit3,
  LoaderCircle,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  startTransition,
  useActionState,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import type { PerfumeSummary } from "@/features/perfumes/types";
import {
  createUsageAction,
  deleteUsageAction,
  updateUsageAction,
  type UsageActionFields,
} from "@/features/usage-log/actions";
import type { ActionState } from "@/lib/auth/types";
import type { UsagePage, UsageRecord } from "@/features/usage-log/types";

import styles from "./usage-diary.module.css";

type Filters = {
  period: "today" | "7d" | "30d" | "year" | "all";
  compliments: "all" | "with" | "without";
  order: "newest" | "oldest";
};

const periodOptions = [
  ["today", "Hoje"],
  ["7d", "7 dias"],
  ["30d", "30 dias"],
  ["year", "Este ano"],
  ["all", "Tudo"],
] as const;

const occasionOptions = [
  ["trabalho", "Trabalho"],
  ["casual", "Casual"],
  ["encontro", "Encontro"],
  ["formal", "Formal"],
  ["festa", "Festa"],
  ["ar_livre", "Ao ar livre"],
] as const;

const timeOptions = [
  ["manha", "Manhã"],
  ["tarde", "Tarde"],
  ["noite", "Noite"],
  ["madrugada", "Madrugada"],
] as const;

const environmentOptions = [
  ["fechado", "Fechado"],
  ["ar_livre", "Ao ar livre"],
] as const;

const labels = {
  occasion: Object.fromEntries(occasionOptions),
  time: Object.fromEntries(timeOptions),
  environment: Object.fromEntries(environmentOptions),
} as Record<string, Record<string, string>>;

function filterHref(filters: Filters, change: Partial<Filters>) {
  const next = { ...filters, ...change };
  return `/diario?period=${next.period}&compliments=${next.compliments}&order=${next.order}`;
}

function formatUsedAt(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function toLocalInput(value: string) {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function segmentedField(
  legend: string,
  name: string,
  options: readonly (readonly [string, string])[],
  defaultValue?: string,
) {
  return (
    <fieldset className={styles.segmentedField}>
      <legend>{legend}</legend>
      <div className={styles.segmented}>
        {options.map(([value, label]) => (
          <label key={value}>
            <input
              aria-label={
                name === "satisfaction"
                  ? `Satisfação ${value} de 5`
                  : undefined
              }
              defaultChecked={value === defaultValue}
              name={name}
              required
              type="radio"
              value={value}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function fieldError(
  state: ActionState<UsageActionFields>,
  field: keyof UsageActionFields,
) {
  const message = state.fieldErrors?.[field]?.[0];
  return message ? <span className={styles.fieldError}>{message}</span> : null;
}

function UsageEditor({
  onClose,
  perfumes,
  usage,
}: {
  onClose: () => void;
  perfumes: PerfumeSummary[];
  usage: UsageRecord | null;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const [compliments, setCompliments] = useState(usage?.complimentsCount ?? 0);
  const [weatherEnabled, setWeatherEnabled] = useState(usage?.weatherSource !== null);
  const action = usage ? updateUsageAction.bind(null, usage.id) : createUsageAction;
  const [state, formAction, pending] = useActionState<
    ActionState<UsageActionFields>,
    FormData
  >(action, { status: "idle" });

  useEffect(() => {
    closeRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  function trapFocus(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])',
      ) ?? [],
    );
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
      onClose();
    }
  }, [onClose, router, state.status]);

  return (
    <div className={styles.modalBackdrop}>
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className={styles.editor}
        onKeyDown={trapFocus}
        ref={dialogRef}
        role="dialog"
      >
        <header className={styles.editorHeader}>
          <div>
            <p className={styles.kicker}>Experiência real</p>
            <h2 id={titleId}>{usage ? "Editar uso" : "Registrar uso"}</h2>
          </div>
          <button aria-label="Fechar formulário" onClick={onClose} ref={closeRef} type="button">
            <X aria-hidden="true" size={20} />
          </button>
        </header>

        <form action={formAction} className={styles.form}>
          <div className={styles.primaryFields}>
            <label>
              Fragrância
              <select
                defaultValue={usage?.perfumeId ?? ""}
                name="perfumeId"
                required
              >
                <option disabled value="">
                  Selecione na sua estante
                </option>
                {perfumes.map((perfume) => (
                  <option key={perfume.id} value={perfume.id}>
                    {perfume.name} — {perfume.brand}
                  </option>
                ))}
              </select>
              {fieldError(state, "perfumeId")}
            </label>
            <label>
              Data e horário
              <input
                defaultValue={toLocalInput(usage?.usedAt ?? new Date().toISOString())}
                max={toLocalInput(new Date().toISOString())}
                name="usedAt"
                required
                type="datetime-local"
              />
              {fieldError(state, "usedAt")}
            </label>
          </div>

          {segmentedField("Ocasião", "occasionKey", occasionOptions, usage?.occasionKey)}
          {segmentedField("Período", "timeKey", timeOptions, usage?.timeKey)}
          {segmentedField(
            "Ambiente",
            "environmentKey",
            environmentOptions,
            usage?.environmentKey,
          )}

          <fieldset className={styles.segmentedField}>
            <legend>Elogios</legend>
            <div className={styles.segmented}>
              {[0, 1, 2, 3, 4].map((value) => (
                <label key={value}>
                  <input
                    aria-label={value === 0 ? "Zero elogios" : value === 4 ? "Quatro ou mais elogios" : `${value} elogios`}
                    checked={(value < 4 && compliments === value) || (value === 4 && compliments >= 4)}
                    name="complimentsChoice"
                    onChange={() => setCompliments(value)}
                    type="radio"
                  />
                  <span>{value === 4 ? "4+" : value}</span>
                </label>
              ))}
            </div>
            {compliments >= 4 ? (
              <label className={styles.exactCount}>
                Quantidade exata
                <input
                  min={4}
                  onChange={(event) => setCompliments(Number(event.target.value))}
                  type="number"
                  value={compliments}
                />
              </label>
            ) : null}
            <input name="complimentsCount" type="hidden" value={compliments} />
          </fieldset>

          {segmentedField(
            "Satisfação",
            "satisfaction",
            [1, 2, 3, 4, 5].map(
              (value) => [String(value), `${value}`] as const,
            ),
            usage ? String(usage.satisfaction) : undefined,
          )}
          <span className="sr-only">
            Os botões de satisfação representam uma escala de 1 a 5.
          </span>

          <fieldset className={styles.segmentedField}>
            <legend>Desempenho percebido <small>opcional</small></legend>
            <div className={styles.segmented}>
              <label>
                <input
                  defaultChecked={usage?.performanceRating === null}
                  name="performanceRating"
                  type="radio"
                  value=""
                />
                <span>Não informar</span>
              </label>
              {[1, 2, 3, 4, 5].map((value) => (
                <label key={value}>
                  <input
                    aria-label={`Desempenho ${value} de 5`}
                    defaultChecked={usage?.performanceRating === value}
                    name="performanceRating"
                    type="radio"
                    value={value}
                  />
                  <span>{value}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <section className={styles.optionalSection}>
            <label className={styles.weatherToggle}>
              <input
                checked={weatherEnabled}
                onChange={(event) => setWeatherEnabled(event.target.checked)}
                type="checkbox"
              />
              <CloudSun aria-hidden="true" size={18} />
              Adicionar clima
            </label>
            {weatherEnabled ? (
              <div className={styles.weatherGrid}>
                <input name="weatherSource" type="hidden" value="manual" />
                <label>
                  Temperatura
                  <input
                    defaultValue={usage?.temperature ?? ""}
                    max={100}
                    min={-100}
                    name="temperature"
                    step="0.1"
                    type="number"
                  />
                </label>
                <label>
                  Sensação
                  <input
                    defaultValue={usage?.feelsLike ?? ""}
                    max={100}
                    min={-100}
                    name="feelsLike"
                    step="0.1"
                    type="number"
                  />
                </label>
                <label>
                  Condição
                  <input
                    defaultValue={usage?.weatherCondition ?? ""}
                    maxLength={120}
                    name="weatherCondition"
                  />
                </label>
                <label>
                  Cidade
                  <input defaultValue={usage?.city ?? ""} maxLength={120} name="city" />
                </label>
                <label>
                  Estação
                  <select defaultValue={usage?.seasonKey ?? ""} name="seasonKey">
                    <option value="">Não informar</option>
                    <option value="primavera">Primavera</option>
                    <option value="verao">Verão</option>
                    <option value="outono">Outono</option>
                    <option value="inverno">Inverno</option>
                  </select>
                </label>
              </div>
            ) : (
              <>
                <input name="weatherSource" type="hidden" value="" />
                <input name="temperature" type="hidden" value="" />
                <input name="feelsLike" type="hidden" value="" />
                <input name="weatherCondition" type="hidden" value="" />
                <input name="seasonKey" type="hidden" value="" />
                <input name="city" type="hidden" value="" />
              </>
            )}
          </section>

          <label>
            Observação <small>opcional</small>
            <textarea
              defaultValue={usage?.notes ?? ""}
              maxLength={500}
              name="notes"
              rows={3}
            />
          </label>

          <p aria-live="polite" className={styles.formMessage} role="status">
            {pending ? "Salvando uso…" : state.message}
          </p>
          <footer className={styles.editorFooter}>
            <button className={styles.secondaryButton} onClick={onClose} type="button">
              Cancelar
            </button>
            <button disabled={pending} type="submit">
              {pending ? <LoaderCircle aria-hidden="true" className={styles.spinner} size={17} /> : null}
              {usage ? "Salvar alterações" : "Salvar uso"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export function UsageDiary({
  filters,
  initialPage,
  perfumes,
}: {
  filters: Filters;
  initialPage: UsagePage;
  perfumes: PerfumeSummary[];
}) {
  const router = useRouter();
  const [editorUsage, setEditorUsage] = useState<UsageRecord | null | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<UsageRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const deleteCancelRef = useRef<HTMLButtonElement>(null);
  const deleteDialogRef = useRef<HTMLElement>(null);
  const perfumeById = useMemo(
    () => new Map(perfumes.map((perfume) => [perfume.id, perfume])),
    [perfumes],
  );

  useEffect(() => {
    if (!deleteTarget) return;

    const trigger = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    deleteCancelRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDeleteTarget(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      trigger?.focus();
    };
  }, [deleteTarget]);

  function trapDeleteFocus(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      deleteDialogRef.current?.querySelectorAll<HTMLButtonElement>(
        "button:not([disabled])",
      ) ?? [],
    );
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    startTransition(async () => {
      const result = await deleteUsageAction(deleteTarget.id);
      setDeleting(false);
      if (result.status === "success") {
        setDeleteTarget(null);
        router.refresh();
      }
    });
  }

  const nextHref = initialPage.nextCursor
    ? `${filterHref(filters, {})}&cursorUsedAt=${encodeURIComponent(initialPage.nextCursor.usedAt)}&cursorId=${initialPage.nextCursor.id}`
    : null;

  return (
    <section className={styles.diary}>
      <div className={styles.toolbar}>
        <div>
          <p className={styles.kicker}>Recortes do histórico</p>
          <div aria-label="Período" className={styles.filterGroup}>
            {periodOptions.map(([value, label]) => (
              <Link
                aria-current={filters.period === value ? "page" : undefined}
                href={filterHref(filters, { period: value })}
                key={value}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <button
          className={styles.primaryButton}
          disabled={perfumes.length === 0}
          onClick={() => setEditorUsage(null)}
          type="button"
        >
          <Plus aria-hidden="true" size={18} />
          Registrar uso
        </button>
      </div>

      <div className={styles.secondaryFilters}>
        <div aria-label="Elogios" className={styles.filterGroup}>
          {[
            ["all", "Todos"],
            ["with", "Com elogios"],
            ["without", "Sem elogios"],
          ].map(([value, label]) => (
            <Link
              aria-current={filters.compliments === value ? "page" : undefined}
              href={filterHref(filters, {
                compliments: value as Filters["compliments"],
              })}
              key={value}
            >
              {label}
            </Link>
          ))}
        </div>
        <div aria-label="Ordenação" className={styles.filterGroup}>
          <Link
            aria-current={filters.order === "newest" ? "page" : undefined}
            href={filterHref(filters, { order: "newest" })}
          >
            Mais recentes
          </Link>
          <Link
            aria-current={filters.order === "oldest" ? "page" : undefined}
            href={filterHref(filters, { order: "oldest" })}
          >
            Mais antigos
          </Link>
        </div>
      </div>

      {perfumes.length === 0 ? (
        <div className={styles.emptyState}>
          <Search aria-hidden="true" size={28} />
          <h2>Adicione uma fragrância antes do primeiro uso</h2>
          <p>O Diário vincula cada experiência a um perfume da sua estante.</p>
          <Link href="/colecao/novo">Adicionar perfume</Link>
        </div>
      ) : initialPage.items.length === 0 ? (
        <div className={styles.emptyState}>
          <BookOpen aria-hidden="true" size={28} />
          <h2>Seu diário começa no primeiro uso</h2>
          <p>Registre quando usou uma fragrância e guarde apenas o que realmente aconteceu.</p>
          <button onClick={() => setEditorUsage(null)} type="button">
            Registrar uso
          </button>
        </div>
      ) : (
        <>
          <ol className={styles.timeline}>
            {initialPage.items.map((usage) => {
              const perfume = perfumeById.get(usage.perfumeId);
              if (!perfume) return null;
              return (
                <li className={styles.timelineItem} key={usage.id}>
                  <span aria-hidden="true" className={styles.timelineDot} />
                  <div className={styles.fragranceImage}>
                    {perfume.imageUrl ? (
                      <Image
                        alt={`Frasco de ${perfume.name}`}
                        fill
                        sizes="64px"
                        src={perfume.imageUrl}
                      />
                    ) : (
                      <span aria-hidden="true">{perfume.name.slice(0, 1)}</span>
                    )}
                  </div>
                  <article>
                    <div className={styles.entryHeading}>
                      <div>
                        <time dateTime={usage.usedAt}>{formatUsedAt(usage.usedAt)}</time>
                        <h2>{perfume.name}</h2>
                        <p>{perfume.brand}</p>
                      </div>
                      <div className={styles.entryActions}>
                        <button
                          aria-label={`Editar uso de ${perfume.name}`}
                          onClick={() => setEditorUsage(usage)}
                          type="button"
                        >
                          <Edit3 aria-hidden="true" size={16} />
                        </button>
                        <button
                          aria-label={`Excluir uso de ${perfume.name}`}
                          onClick={() => setDeleteTarget(usage)}
                          type="button"
                        >
                          <Trash2 aria-hidden="true" size={16} />
                        </button>
                      </div>
                    </div>
                    <div className={styles.entryFacts}>
                      <span>{labels.occasion[usage.occasionKey]}</span>
                      <span>{labels.time[usage.timeKey]}</span>
                      <span>{labels.environment[usage.environmentKey]}</span>
                      <span>
                        {usage.complimentsCount === 0
                          ? "Nenhum elogio"
                          : `${usage.complimentsCount} ${usage.complimentsCount === 1 ? "elogio" : "elogios"}`}
                      </span>
                      <span>Satisfação {usage.satisfaction}/5</span>
                      {usage.weatherCondition ? <span>{usage.weatherCondition}</span> : null}
                      {usage.temperature !== null ? <span>{usage.temperature} °C</span> : null}
                    </div>
                    {usage.notes ? <p className={styles.notes}>{usage.notes}</p> : null}
                  </article>
                </li>
              );
            })}
          </ol>
          {nextHref ? (
            <Link className={styles.loadMore} href={nextHref}>
              <CalendarDays aria-hidden="true" size={17} />
              Carregar mais usos
            </Link>
          ) : null}
        </>
      )}

      {editorUsage !== undefined ? (
        <UsageEditor
          key={editorUsage?.id ?? "new"}
          onClose={() => setEditorUsage(undefined)}
          perfumes={perfumes}
          usage={editorUsage}
        />
      ) : null}

      {deleteTarget ? (
        <div className={styles.modalBackdrop}>
          <section
            aria-label="Excluir registro?"
            aria-modal="true"
            className={styles.confirmation}
            onKeyDown={trapDeleteFocus}
            ref={deleteDialogRef}
            role="dialog"
          >
            <p className={styles.kicker}>Ação permanente</p>
            <h2>Excluir registro?</h2>
            <p>Este uso será removido do seu histórico.</p>
            <div>
              <button
                className={styles.secondaryButton}
                onClick={() => setDeleteTarget(null)}
                ref={deleteCancelRef}
                type="button"
              >
                Cancelar
              </button>
              <button disabled={deleting} onClick={confirmDelete} type="button">
                Confirmar exclusão
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
