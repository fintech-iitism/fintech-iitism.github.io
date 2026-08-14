/**
 * The club's divisions, shared by the About panels and the member cards so a
 * division reads the same colour everywhere it appears.
 */
export const DIVISIONS = ['Finance', 'Quant'] as const

export type Division = (typeof DIVISIONS)[number]

/** Tailwind classes for a division's badge: text, border and background tint. */
export const divisionTint: Record<Division, string> = {
  Finance: 'text-brand border-brand/50 bg-brand/10',
  Quant: 'text-[#d9a441] border-[#d9a441]/50 bg-[#d9a441]/10',
}
