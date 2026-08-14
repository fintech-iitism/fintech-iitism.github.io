import type { ReactNode } from 'react'
import type { Member } from '../../data/members'
import { divisionTint } from '../../data/divisions'
import { AsciiHoverImage } from './AsciiHoverImage'
import { GithubIcon, LinkedinIcon, MailIcon } from './BrandIcons'
import { Frame } from './Frame'

const PLACEHOLDER = '/member-placeholder.png'

interface Contact {
  label: string
  href: string
  icon: ReactNode
}

/**
 * Portrait card. The frame is two stacked pixel-clipped boxes: a coloured
 * outer one and an ink inner one inset by the border width, so the visible
 * edge is thick and stair-stepped rather than a hairline rectangle. The
 * portrait runs the hands' ASCII effect: glyphs at rest, and the whole photo
 * cross-fading in on hover.
 *
 * The card is not itself a link: it carries up to three of its own, and an
 * anchor cannot be nested inside another.
 */
export function MemberCard({
  name,
  branch,
  division,
  role,
  email,
  github,
  linkedin,
  image,
}: Member) {
  const contacts: Contact[] = []
  if (github) {
    contacts.push({
      label: `${name} on GitHub`,
      href: github,
      icon: <GithubIcon className="h-full w-full" />,
    })
  }
  if (linkedin) {
    contacts.push({
      label: `${name} on LinkedIn`,
      href: linkedin,
      icon: <LinkedinIcon className="h-full w-full" />,
    })
  }
  if (email) {
    contacts.push({
      label: `Email ${name}`,
      href: `mailto:${email}`,
      icon: <MailIcon className="h-full w-full" />,
    })
  }

  return (
    <Frame className="group h-full" innerClassName="flex flex-col p-3">
      <article className="flex h-full flex-col">
        {/* Fixed box so portraits of any ratio stay on the grid; the ASCII
            canvas fills it and the photo underneath only sets the height. */}
        <AsciiHoverImage
          src={image ?? PLACEHOLDER}
          alt={name}
          cellSize={7}
          fullReveal
          className="relative aspect-[4/5] w-full overflow-hidden"
        />

        {/* Rank sits above the name as a spaced mono eyebrow, the same label
            treatment the division panels use, rather than as a filled tag on
            the portrait: a solid block with square corners is the one shape
            the pixel frames never make. The row is held open even without a
            rank, so every name in a row of cards starts on the same line. The
            filler is a non-breaking space; a plain one collapses and the row
            loses its height. */}
        <p
          className="mt-4 font-mono text-2xs tracking-[0.2em] text-brand"
          aria-hidden={role ? undefined : true}
        >
          {role?.toUpperCase() ?? ' '}
        </p>

        <h3 className="mt-1.5 font-pixel text-sm leading-tight break-words text-white">
          {name}
        </h3>
        <p className="mt-1 font-mono text-xs leading-relaxed text-white/50">
          {branch}
        </p>

        {/* Pushed to the bottom so the contact row lines up across a row of
            cards whose names and branches wrap to different heights. */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
          {division ? (
            <span
              className={`border px-1.5 py-0.5 font-mono text-2xs tracking-[0.15em] ${divisionTint[division]}`}
            >
              {division.toUpperCase()}
            </span>
          ) : null}

          {contacts.length > 0 ? (
            <ul className="flex items-center gap-2.5 text-white/50">
              {contacts.map((contact) => (
                <li key={contact.href} className="h-4 w-4">
                  <a
                    href={contact.href}
                    target={contact.href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    aria-label={contact.label}
                    title={contact.label}
                    className="block h-full w-full transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    {contact.icon}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </article>
    </Frame>
  )
}
