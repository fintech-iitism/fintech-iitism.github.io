import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { DivisionModal } from './DivisionModal'
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
  /** Extra copy shown once the panel is opened. */
  details: DivisionDetail[]
  /** ASCII sim for the division. */
  visual?: ReactNode
}

/**
 * One division as a pixel-framed card: the same two stacked clipped boxes as
 * the member cards, so the divisions and the people read as one system. The
 * whole card is a button, and clicking it opens the division as a dialog over
 * the page rather than growing the card in the flow, which would push the rest
 * of the section down and leave the reader scrolling to catch up.
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
  const [open, setOpen] = useState(false)
  const right = from === 'right'

  return (
    <motion.article
      initial={still ? false : { opacity: 0, y: 24 }}
      whileInView={still ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="pixel-frame w-full bg-white/15 p-[4px] transition-colors hover:bg-brand/70"
    >
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="pixel-frame grid w-full cursor-pointer gap-8 bg-ink px-6 py-10 text-left md:grid-cols-5 md:items-center md:gap-12 md:px-10 md:py-12 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
      >
        <div className={`min-w-0 md:col-span-2 ${right ? 'md:order-2' : ''}`}>
          <p className="flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-white/40">
            {String(index).padStart(2, '0')} / DIVISION
            <span aria-hidden="true" className="text-brand">
              [ + ]
            </span>
          </p>

          <h3 className="mt-3 font-pixel text-2xl leading-tight text-white md:text-3xl">
            {title}
          </h3>

          <PixelRule length={7} className="mt-3 text-sm text-brand" />

          <p className="mt-4 max-w-md font-mono text-sm leading-relaxed text-white/70 md:text-base">
            {body}
          </p>

          <p className="mt-4 font-mono text-xs text-brand/80">Read more</p>
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
      </button>

      <AnimatePresence>
        {open ? (
          <DivisionModal
            index={index}
            title={title}
            body={body}
            details={details}
            visual={visual}
            onClose={() => setOpen(false)}
          />
        ) : null}
      </AnimatePresence>
    </motion.article>
  )
}
