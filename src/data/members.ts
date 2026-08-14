import type { Division } from './divisions'
import type { Role } from './roles'
import roster from './members.json'

/** One row of `members.json`, before the photo reference is resolved. */
interface MemberEntry {
  name: string
  /** Institute admission number. Doubles as the roster's unique key. */
  admission: string
  /**
   * Graduation year, written out rather than derived from the admission
   * number's year prefix: degree lengths differ across programmes.
   */
  batch: number
  branch: string
  /** Set once a member picks a division; absent while they are unassigned. */
  division?: Division
  /** Rank held in the club. Absent for a member without one. */
  role?: Role
  email?: string
  github?: string
  linkedin?: string
  /**
   * Either a path under /public (`/members/foo.png`) or a Google Drive
   * reference (`drive:<fileId>`). Drive entries are downloaded into
   * /public/members by `npm run photos`; omit the field for the placeholder.
   * Drive *folder* links carry no file id, so they cannot be used here.
   */
  photo?: string
}

export interface Member {
  name: string
  admission: string
  batch: number
  branch: string
  division?: Division
  role?: Role
  email?: string
  github?: string
  linkedin?: string
  image?: string
}

/**
 * Filename a member's downloaded photo lands on. Keyed on the admission number
 * rather than the name, which is neither unique nor stable. Mirrored in
 * scripts/sync-photos.mjs.
 */
export const photoSlug = (admission: string): string => admission.toLowerCase()

const resolvePhoto = (entry: MemberEntry): string | undefined => {
  if (!entry.photo) return undefined
  if (!entry.photo.startsWith('drive:')) return entry.photo
  return `/members/${photoSlug(entry.admission)}.jpg`
}

export const members: Member[] = (roster as MemberEntry[]).map((entry) => ({
  name: entry.name,
  admission: entry.admission,
  batch: entry.batch,
  branch: entry.branch,
  division: entry.division,
  role: entry.role,
  email: entry.email,
  github: entry.github,
  linkedin: entry.linkedin,
  image: resolvePhoto(entry),
}))

export interface Batch {
  /** Graduation year the group is headed by. */
  year: number
  members: Member[]
}

/**
 * The roster split into graduating years, earliest first, so the members page
 * grows a new heading as juniors join rather than needing a layout change.
 */
export const batches: Batch[] = [...new Set(members.map((m) => m.batch))]
  .sort((a, b) => a - b)
  .map((year) => ({
    year,
    members: members.filter((m) => m.batch === year),
  }))
