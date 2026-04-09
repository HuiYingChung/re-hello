/**
 * Rehello logo — the official wordmark.
 *
 * "Re·hello" — typographic logo using Instrument Serif (loaded in
 * layout.tsx). The accent dot between "Re" and "hello" gently signals
 * the *return* — meeting again, remembering again. The "Re" is in the
 * brand accent; the dot mirrors that accent and sits slightly raised.
 *
 * Use <Logo /> with a size. The component inherits the page's font and
 * stays crisp at any zoom because it's pure text + a glyph.
 */

export type LogoSize = "sm" | "md" | "lg" | "xl";

const SIZE: Record<LogoSize, { font: string; gap: string }> = {
  sm: { font: "text-xl", gap: "gap-[0.15em]" },
  md: { font: "text-3xl", gap: "gap-[0.18em]" },
  lg: { font: "text-5xl", gap: "gap-[0.2em]" },
  xl: { font: "text-7xl", gap: "gap-[0.22em]" },
};

export function Logo({
  size = "md",
  className = "",
}: {
  size?: LogoSize;
  className?: string;
}) {
  const s = SIZE[size];

  return (
    <span
      className={`inline-flex items-baseline ${s.gap} font-serif leading-none text-[var(--foreground)] ${s.font} ${className}`}
      aria-label="Rehello"
    >
      <span className="text-[var(--accent-strong)]">Re</span>
      <span
        className="inline-block translate-y-[-0.18em] text-[var(--accent-strong)]"
        aria-hidden
      >
        ·
      </span>
      <span>hello</span>
    </span>
  );
}
