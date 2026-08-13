interface PixelRuleProps {
  /** Number of dashes drawn. */
  length?: number
  className?: string
}

/** Decorative dashed divider drawn in the pixel face, as on the hero. */
export function PixelRule({ length = 13, className = '' }: PixelRuleProps) {
  return (
    <div
      aria-hidden="true"
      className={`font-pixel tracking-[0.15em] text-white ${className}`}
    >
      {'-'.repeat(length)}
    </div>
  )
}
