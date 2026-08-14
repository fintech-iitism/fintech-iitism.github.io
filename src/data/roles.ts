/**
 * Ranks a member can hold, on top of their division. Kept apart from
 * `divisions.ts` because the two are different axes: a member has at most one
 * of each, and the card shows them in different places.
 */
export const ROLES = ['Coordinator', 'Co-coordinator', 'Developer'] as const

export type Role = (typeof ROLES)[number]
