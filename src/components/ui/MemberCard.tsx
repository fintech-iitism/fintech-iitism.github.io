import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import type { Member } from '../../data/members'
import { useCoarsePointer } from '../../hooks/useCoarsePointer'
import { AsciiHoverImage } from './AsciiHoverImage'
import { Frame } from './Frame'
import { MemberContacts } from './MemberContacts'
import { MemberModal } from './MemberModal'

const PLACEHOLDER = '/member-placeholder.png'

/**
 * Portrait card. The frame is two stacked pixel-clipped boxes: a coloured
 * outer one and an ink inner one inset by the border width, so the visible
 * edge is thick and stair-stepped rather than a hairline rectangle. The
 * portrait runs the hands' ASCII effect: glyphs at rest, and the whole photo
 * cross-fading in on hover.
 *
 * On a device that cannot hover there is nothing to cross-fade with, so the
 * portrait and the name become a button that opens the member as a dialog with
 * the photograph in it. Tapping is the touch equivalent of hovering, rather
 * than a second, different affordance bolted on.
 *
 * The card is not itself a link: it carries up to three of its own, and an
 * anchor cannot be nested inside another.
 */
export function MemberCard(member: Member) {
  const { name, branch, role, image } = member
  const coarse = useCoarsePointer()
  const [open, setOpen] = useState(false)

  const portrait = (
    <>
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
          filler has to be an escaped non-breaking space: a plain one collapses,
          the row loses its height, and the cards that do have a rank push their
          names a line lower than the ones that do not. */}
      <p
        className="mt-4 font-mono text-2xs tracking-[0.2em] text-brand"
        aria-hidden={role ? undefined : true}
      >
        {role?.toUpperCase() ?? '\u00A0'}
      </p>

      <h3 className="mt-1.5 font-pixel text-sm leading-tight break-words text-white">
        {name}
      </h3>
      <p className="mt-1 font-mono text-xs leading-relaxed text-white/50">
        {branch}
      </p>
    </>
  )

  return (
    <Frame className="group h-full" innerClassName="flex flex-col p-3">
      <article className="flex h-full flex-col">
        {coarse ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            className="w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
          >
            {portrait}
          </button>
        ) : (
          portrait
        )}

        {/* Pushed to the bottom so the contact row lines up across a row of
            cards whose names and branches wrap to different heights. Kept
            outside the button: these are links in their own right, and a tap
            meant for one of them must not open the dialog instead. */}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
          <MemberContacts {...member} />
        </div>
      </article>

      <AnimatePresence>
        {open ? (
          <MemberModal member={member} onClose={() => setOpen(false)} />
        ) : null}
      </AnimatePresence>
    </Frame>
  )
}
