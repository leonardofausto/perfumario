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
          <path d="M16 3.5c1.7 4.8 7.3 8.2 7.3 14a7.3 7.3 0 0 1-14.6 0c0-5.8 5.6-9.2 7.3-14Z" />
          <path d="M12.1 18.2a4.1 4.1 0 0 0 6.8 3" />
          <path d="M10.4 8.2 7.7 5.5M21.6 8.2l2.7-2.7" />
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
