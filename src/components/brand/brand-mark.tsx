type BrandMarkProps = {
  compact?: boolean;
  inverse?: boolean;
};

export function BrandMark({ compact = false, inverse = false }: BrandMarkProps) {
  return (
    <span
      aria-label="Perfumário — Nossa estante virtual inteligente"
      className="brand-mark"
      data-compact={compact || undefined}
      data-inverse={inverse || undefined}
    >
      <span aria-hidden="true" className="brand-symbol">
        <svg viewBox="0 0 32 32">
          <path d="M12 4.5h8v4.5h-8z" />
          <path d="M13.5 9v3h5V9" />
          <path d="M7.5 12h17a1.5 1.5 0 0 1 1.5 1.5v12a2 2 0 0 1-2 2h-16a2 2 0 0 1-2-2v-12a1.5 1.5 0 0 1 1.5-1.5Z" />
          <path d="M11.5 19.5h9" />
        </svg>
      </span>
      {!compact && (
        <span className="brand-copy">
          <strong>Perfumário</strong>
          <small>Nossa estante virtual inteligente</small>
        </span>
      )}
    </span>
  );
}
