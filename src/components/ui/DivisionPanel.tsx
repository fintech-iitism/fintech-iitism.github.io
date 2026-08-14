import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Frame } from './Frame'
import { PixelRule } from './PixelRule'

export interface DivisionDetail {
  label: string
  body: string
}

interface DivisionPanelProps {
  /** Position in the list, printed as the panel's index. */
  index: number
  title: string
  body: string
  /** Side the sim sits on from md, so the two divisions mirror each other. */
  from: 'left' | 'right'
  /** What the division actually does, broken into its strands. */
  details: DivisionDetail[]
  /** ASCII sim for the division. */
  visual?: ReactNode
}

/**
 * One division as a pixel-framed card: the same two stacked clipped boxes as
 * the member cards, so the divisions and the people read as one system.
 *
 * Everything is on the page at once. The detail used to be behind a click that
 * opened the panel as a dialog, which hid the part that answers what the
 * division does behind an interaction a reader has no reason to expect.
 */
export function DivisionPanel({
  index,
  title,
  body,
  from,
  details,
  visual,
}: DivisionPanelProps) {
  const still = useReducedMotion()
  const right = from === 'right'

  return (
    <motion.article
      initial={still ? false : { opacity: 0, y: 24 }}
      whileInView={still ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full"
    >
      <Frame innerClassName="px-6 py-10 md:px-10 md:py-12">
        <div className="grid gap-8 md:grid-cols-5 md:items-center md:gap-12">
          <div className={`min-w-0 md:col-span-2 ${right ? 'md:order-2' : ''}`}>
            <p className="font-mono text-xs tracking-[0.2em] text-white/40">
              {String(index).padStart(2, '0')} / DIVISION
            </p>

            <h3 className="mt-3 font-pixel text-2xl leading-tight text-white">
              {title}
            </h3>

            <PixelRule length={7} className="mt-3 text-sm text-brand" />

            <p className="mt-4 max-w-md font-mono text-sm leading-relaxed text-white/70">
              {body}
            </p>
          </div>

          {/* The sim takes the wider share: the chart needs the columns more
              than the copy does. */}
          {visual ? (
            <div
              className={`h-64 min-w-0 md:col-span-3 md:h-72 ${right ? 'md:order-1' : ''}`}
            >
              {visual}
            </div>
          ) : null}
        </div>

        <PixelRule length={26} className="mt-10 text-sm text-white/25" />

        <dl className="mt-6 grid gap-6 md:grid-cols-2 md:gap-8">
          {details.map((detail) => (
            <div key={detail.label} className="min-w-0">
              <dt className="font-pixel text-sm text-brand">{detail.label}</dt>
              <dd className="mt-2 font-mono text-xs leading-relaxed text-white/70">
                {detail.body}
              </dd>
            </div>
          ))}
        </dl>
      </Frame>
    </motion.article>
  )
}
