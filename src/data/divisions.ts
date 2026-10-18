/** The club's divisions. A member may belong to one; it is not shown on the card. */
export const DIVISIONS = ['Finance', 'Quant'] as const

export type Division = (typeof DIVISIONS)[number]
