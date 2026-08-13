import type { Member } from '../../data/members'
import { AsciiHoverImage } from './AsciiHoverImage'

const PLACEHOLDER = '/member-placeholder.png'

/**
 * Portrait card. The frame is two stacked pixel-clipped boxes: a coloured
 * outer one and an ink inner one inset by the border width, so the visible
 * edge is thick and stair-stepped rather than a hairline rectangle. The
 * portrait runs the hands' ASCII effect: glyphs at rest, and the whole photo
 * cross-fading in on hover.
 */
export function MemberCard({ name, designation, image, href }: Member) {
  const card = (
    <article className="group pixel-frame bg-white/15 p-[4px] transition-colors hover:bg-brand/70">
      <div className="pixel-frame flex flex-col bg-ink p-3">
        {/* Fixed box so portraits of any ratio stay on the grid; the ASCII
            canvas fills it and the photo underneath only sets the height. */}
        <AsciiHoverImage
          src={image ?? PLACEHOLDER}
          alt={name}
          cellSize={7}
          fullReveal
          className="relative aspect-[4/5] w-full overflow-hidden"
        />

        <h3 className="mt-4 font-pixel text-sm text-white md:text-base">
          {name}
        </h3>
        <p className="mt-1 font-mono text-xs text-brand/80">{designation}</p>
      </div>
    </article>
  )

  if (!href) return card

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
    >
      {card}
    </a>
  )
}
