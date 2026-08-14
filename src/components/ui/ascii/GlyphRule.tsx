import { useLayoutEffect, useRef, useState } from 'react'
import type { AsciiVariant } from './frameStyle'
import {
  DENSE,
  DRIFT,
  DRIFT_RATE,
  PULSE_CPS,
  PULSE_PACKET,
  SPARK,
  from,
  rand,
} from './glyphs'
import { GLYPH_FPS, useGlyphFrame } from './useGlyphFrame'

interface GlyphRuleProps {
  /** Number of glyphs drawn. Ignored when the rule fills its container. */
  length?: number
  /** Stretch to the container's width, recounting glyphs as it resizes. */
  fill?: boolean
  /**
   * Treatment to draw. Rules are a still run of dashes by default; the moving
   * ones are kept for edges that want to draw the eye.
   */
  variant?: AsciiVariant | 'plain'
  className?: string
}

/** Glyphs in the probe used to measure one character's advance. */
const SAMPLE = 20

/**
 * A line in place of a border: a run of dashes with a packet of heavier glyphs
 * travelling along it, stepping on the page's shared clock so every rule and
 * every border moves on one beat.
 *
 * This is for edges that used to be hairline borders. Dividers that sit under
 * a heading stay still, and stay `PixelRule`.
 */
export function GlyphRule({
  length = 13,
  fill = false,
  variant = 'plain',
  className = '',
}: GlyphRuleProps) {
  // Per-rule offset into the noise, so two rules on the same screen are not
  // flickering the same glyphs in the same places.
  const [seed] = useState(() => Math.random() * 997)
  const beat = useGlyphFrame(variant !== 'plain')

  const box = useRef<HTMLDivElement>(null)
  const probe = useRef<HTMLSpanElement>(null)
  const [measured, setMeasured] = useState(length)

  // A filling rule cannot know its glyph count up front: the pixel face has no
  // stable ratio to its size, so one is measured off a hidden run of glyphs in
  // the rule's own type and the container is divided by it.
  useLayoutEffect(() => {
    const el = box.current
    const sample = probe.current
    if (!fill || !el || !sample) return

    const measure = () => {
      const per = sample.getBoundingClientRect().width / SAMPLE
      if (per > 0 && el.clientWidth > 0) {
        setMeasured(Math.max(2, Math.floor(el.clientWidth / per)))
      }
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    // The pixel face is a web font: its metrics land after the first paint.
    void document.fonts?.ready.then(measure)

    return () => observer.disconnect()
  }, [fill])

  const count = fill ? measured : length
  // Started off screen to the left, so the packet enters the run rather than
  // appearing part way along it on the first beat.
  const head = (((beat / GLYPH_FPS) * PULSE_CPS + seed) % (count + PULSE_PACKET)) - PULSE_PACKET

  let run = ''
  for (let i = 0; i < count; i++) {
    const at = i + seed
    if (variant === 'plain') {
      run += '-'
    } else if (variant === 'noise') {
      run += from(DENSE, rand(at * 3.1 + beat))
    } else if (variant === 'pulse') {
      const lead = i - head
      run +=
        lead >= 0 && lead < PULSE_PACKET
          ? from(SPARK, rand(at * 5.7 + beat))
          : '-'
    } else {
      run +=
        rand(at * 7.3 + beat) < DRIFT_RATE
          ? from(DRIFT, rand(at * 2.9 + beat + 1))
          : '-'
    }
  }

  return (
    <div
      ref={box}
      aria-hidden="true"
      // Monospace, unlike the static rules: the packet rolls new glyphs every
      // beat, and in the proportional pixel face each one is a different width,
      // which slides the whole run to the right of it back and forth. It also
      // has to stay out of the caller's way on `position`, since a rule pinned
      // to a box's edge is absolute and Tailwind emits `relative` last.
      className={`font-mono tracking-[0.15em] text-white ${
        fill ? 'overflow-hidden whitespace-nowrap' : ''
      } ${className}`}
    >
      {fill ? (
        <span
          ref={probe}
          className="invisible absolute left-0 top-0 whitespace-pre"
        >
          {'-'.repeat(SAMPLE)}
        </span>
      ) : null}
      {run}
    </div>
  )
}
