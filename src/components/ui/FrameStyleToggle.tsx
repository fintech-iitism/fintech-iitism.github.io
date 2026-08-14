import { useState } from 'react'
import {
  FRAME_LABELS,
  FRAME_MOTIONS,
  FRAME_STYLES,
  MOTION_LABELS,
  useFrameStyle,
} from './ascii/frameStyle'

const chip = (on: boolean): string =>
  `border px-2 py-1 font-mono text-[10px] tracking-[0.15em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
    on
      ? 'border-brand bg-brand/20 text-brand'
      : 'border-white/20 text-white/50 hover:border-white/40 hover:text-white'
  }`

/**
 * Floating control for comparing the box borders on the live page. Deliberately
 * plain, and deliberately not one of the framed boxes: it has to stay readable
 * whichever edge is being tried out.
 */
export function FrameStyleToggle() {
  const { style, motion, setStyle, setMotion } = useFrameStyle()
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 border border-white/20 bg-ink/85 px-2 py-1 font-mono text-[10px] tracking-[0.15em] text-white/50 backdrop-blur transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        BORDERS
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 border border-white/20 bg-ink/85 p-3 backdrop-blur">
      <div className="flex items-center justify-between gap-6">
        <p className="font-mono text-[10px] tracking-[0.2em] text-white/40">
          BORDERS
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Hide border controls"
          className="font-mono text-xs text-white/40 transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          X
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {FRAME_STYLES.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setStyle(option)}
            aria-pressed={style === option}
            className={chip(style === option)}
          >
            {FRAME_LABELS[option].toUpperCase()}
          </button>
        ))}
      </div>

      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {FRAME_MOTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setMotion(option)}
            aria-pressed={motion === option}
            disabled={style === 'pixel'}
            className={`${chip(motion === option)} disabled:opacity-30 disabled:hover:border-white/20 disabled:hover:text-white/50`}
          >
            {MOTION_LABELS[option].toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}
