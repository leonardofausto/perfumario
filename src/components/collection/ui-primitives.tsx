"use client";

import { X } from "lucide-react";
import { useId, useState, type KeyboardEvent } from "react";

import {
  PERCENT_MAX,
  PERCENT_MIN,
  formatOptionalText,
  formatPercent,
  validatePercent,
} from "@/features/perfumes/constants";

import styles from "./ui-primitives.module.css";

type PercentageFieldProps = {
  label: string;
  name: string;
  value: number | null;
  error?: string;
  showPreview?: boolean;
  onChange: (value: number | null) => void;
};

export function PercentageField({
  label,
  name,
  value,
  error,
  showPreview = false,
  onChange,
}: PercentageFieldProps) {
  const inputId = useId();
  const errorId = useId();
  const safeValue =
    value === null ? null : Math.min(PERCENT_MAX, Math.max(PERCENT_MIN, value));
  const formatted = formatPercent(safeValue);

  return (
    <label className={styles.field} htmlFor={inputId}>
      <span className={styles.fieldHeader}>
        <span>{label}</span>
        <strong>{formatted}</strong>
      </span>
      <span className={styles.fieldControl}>
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
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => {
            const nextValue = event.target.value;
            onChange(nextValue === "" ? null : Number(nextValue));
          }}
        />
      </span>
      {showPreview ? (
        <span className={styles.fieldTrack} aria-hidden="true">
          <span
            className={styles.fieldFill}
            style={{ width: `${safeValue ?? 0}%` }}
          />
        </span>
      ) : null}
      {error ? (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function PercentageBar({ label, value }: { label: string; value: number | null }) {
  if (value === null) {
    return <EmptyMetricState label={label} />;
  }

  const safeValue = Math.min(PERCENT_MAX, Math.max(PERCENT_MIN, value));
  const formatted = formatPercent(safeValue);

  return (
    <div
      className={styles.bar}
      role="progressbar"
      aria-label={`${label}: ${formatted}`}
      aria-valuemin={PERCENT_MIN}
      aria-valuemax={PERCENT_MAX}
      aria-valuenow={safeValue}
    >
      <div className={styles.barHeader}>
        <span className={styles.barLabel}>{label}</span>
        <span className={styles.barValue}>{formatted}</span>
      </div>
      <div className={styles.track} aria-hidden="true">
        <span className={styles.fill} style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}

export function EmptyMetricState({ label }: { label: string }) {
  return (
    <div className={styles.emptyMetric}>
      <strong>{label}</strong>
      <span>{formatPercent(null)}</span>
    </div>
  );
}

export function MetadataChip({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <span className={styles.chip}>
      <strong>{label}</strong>
      <span>{formatOptionalText(value)}</span>
    </span>
  );
}

type TagInputProps = {
  label: string;
  name: string;
  value: string[];
  error?: string;
  onChange: (value: string[]) => void;
};

function normalizeTag(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function TagInput({ label, name, value, error, onChange }: TagInputProps) {
  const inputId = useId();
  const errorId = useId();
  const [draft, setDraft] = useState("");

  function addTag() {
    const tag = normalizeTag(draft);
    if (!tag || value.some((item) => item.toLocaleLowerCase("pt-BR") === tag.toLocaleLowerCase("pt-BR"))) {
      return;
    }

    onChange([...value, tag]);
    setDraft("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((item) => item !== tag));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag();
    }
  }

  return (
    <div className={styles.tagInput}>
      <label className={styles.field} htmlFor={inputId}>
        {label}
        <input
          id={inputId}
          name={`${name}Draft`}
          value={draft}
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onBlur={addTag}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        {error ? (
          <span id={errorId} className={styles.error}>
            {error}
          </span>
        ) : null}
      </label>
      <input type="hidden" name={name} value={JSON.stringify(value)} />
      {value.length ? (
        <ul className={styles.tags} aria-label={`${label} selecionados`}>
          {value.map((tag) => (
            <li className={styles.tag} key={tag}>
              {tag}
              <button
                type="button"
                aria-label={`Remover ${tag}`}
                onClick={() => removeTag(tag)}
              >
                <X size={13} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export { validatePercent };
