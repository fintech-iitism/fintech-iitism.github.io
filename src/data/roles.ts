/**
 * Positions a member can hold, shown above their name on the card. Kept apart
 * from `divisions.ts` because the two are different axes: a member has at most
 * one of each.
 */
export const ROLES = [
  'Coordinator',
  'Co-coordinator',
  'Quant Head',
  'Finance Head',
  'Developer',
  'Outreach',
] as const

export type Role = (typeof ROLES)[number]
