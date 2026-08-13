import roster from './members.json'

/** One row of `members.json`, before the photo reference is resolved. */
interface MemberEntry {
  name: string
  designation: string
  /**
   * Either a path under /public (`/members/foo.png`) or a Google Drive
   * reference (`drive:<fileId>`). Drive entries are downloaded into
   * /public/members by `npm run photos`; omit the field for the placeholder.
   */
  photo?: string
  /** Optional profile link, e.g. LinkedIn. */
  href?: string
}

export interface Member {
  name: string
  designation: string
  image?: string
  href?: string
}

/** Filename a member's downloaded photo lands on. Mirrored in scripts/sync-photos.mjs. */
export const photoSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const resolvePhoto = (entry: MemberEntry): string | undefined => {
  if (!entry.photo) return undefined
  if (!entry.photo.startsWith('drive:')) return entry.photo
  return `/members/${photoSlug(entry.name)}.jpg`
}

export const members: Member[] = (roster as MemberEntry[]).map((entry) => ({
  name: entry.name,
  designation: entry.designation,
  image: resolvePhoto(entry),
  href: entry.href,
}))
