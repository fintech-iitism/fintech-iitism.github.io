import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'motion/react'
import { useDialog } from '../../hooks/useDialog'
import { Frame } from './Frame'
import { PixelRule } from './PixelRule'
import type { DivisionDetail } from './DivisionPanel'

interface DivisionModalProps {
  index: number
  title: string
  body: string
  details: DivisionDetail[]
  visual?: ReactNode
  onClose: () => void
}

/**
 * The opened division, as a dialog over the whole page. Rendered through a
 * portal on purpose: the card sits inside a transformed motion element, and a
 * transformed ancestor would make `position: fixed` resolve against the card
 * instead of the viewport.
 */
export function DivisionModal({
  index,
  title,
  body,
  details,
  visual,
  onClose,
}: DivisionModalProps) {
  const still = useReducedMotion()
  // Escape closes, and the page behind is frozen so the scroll wheel acts on
  // the dialog rather than the section underneath it.
  const panel = useDialog(onClose)

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      <motion.div
        aria-hidden="true"
        onClick={onClose}
        initial={still ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: still ? 0 : 0.2 }}
        className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
      />

      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={`${title} division`}
        tabIndex={-1}
        initial={still ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={still ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
        transition={{ duration: still ? 0 : 0.28, ease: 'easeOut' }}
        className="relative flex max-h-[90svh] w-full max-w-5xl flex-col focus:outline-none"
      >
        <Frame
          tone="brand"
          className="flex min-h-0 flex-1 flex-col"
          innerClassName="overflow-y-auto px-6 py-10 md:px-10 md:py-12"
        >
          <div className="grid gap-8 md:grid-cols-5 md:items-center md:gap-12">
            <div className="min-w-0 md:col-span-2">
              <p className="font-mono text-xs tracking-[0.2em] text-white/40">
                {String(index).padStart(2, '0')} / DIVISION
              </p>

              <h3 className="mt-3 font-pixel text-2xl leading-tight text-white">
                {title}
              </h3>

              <PixelRule length={7} className="mt-3 text-sm text-brand" />

              <p className="mt-4 font-mono text-sm leading-relaxed text-white/70">
                {body}
              </p>
            </div>

            {visual ? (
              <div className="h-56 min-w-0 md:col-span-3 md:h-72">{visual}</div>
            ) : null}
          </div>

          <PixelRule length={26} className="mt-8 text-sm text-white/25" />

          <dl className="mt-6 grid gap-6 md:grid-cols-2 md:gap-8">
            {details.map((detail) => (
              <div key={detail.label} className="min-w-0">
                <dt className="font-pixel text-sm text-brand">
                  {detail.label}
                </dt>
                <dd className="mt-2 font-mono text-xs leading-relaxed text-white/70">
                  {detail.body}
                </dd>
              </div>
            ))}
          </dl>
        </Frame>

        {/* Outside the frame's scrolling box, so it stays pinned to the corner
            while the details scroll under it. */}
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${title}`}
          className="absolute right-4 top-4 z-10 font-pixel text-lg text-white/60 transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:right-6 md:top-6"
        >
          X
        </button>
      </motion.div>
    </div>,
    document.body,
  )
}
