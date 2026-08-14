/**
 * Ranks a member can hold, on top of their division. Kept apart from
 * `divisions.ts` because the two are different axes: a member has at most one
 * of each, and the card shows them in different places.
 */
export const ROLES = ['Coordinator', 'Co-coordinator', 'Developer'] as const

export type Role = (typeof ROLES)[number]

/**
 * Tailwind classes for a rank tag. Solid fills, so a rank never reads as
 * another division chip: the two leadership ranks share the brand family and
 * the working role sits in neutral.
 */
export const roleTint: Record<Role, string> = {
  Coordinator: 'bg-brand text-ink',
  'Co-coordinator': 'bg-brand/75 text-ink',
  Developer: 'bg-white/85 text-ink',
}
