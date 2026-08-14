import { useEffect, useState } from 'react'

/** Beats per second every glyph rule on the page steps on. */
export const GLYPH_FPS = 10

type Listener = (frame: number) => void

// One clock for the whole page rather than a loop per rule: the rules are
// spread across sections but they should tick together, and a dozen separate
// animation frames to advance the same counter is a dozen too many.
const listeners = new Set<Listener>()
let raf = 0
let frame = 0
let painted = 0

const tick = (t: number) => {
  raf = requestAnimationFrame(tick)
  if (t - painted < 1000 / GLYPH_FPS) return
  painted = t
  frame += 1
  listeners.forEach((notify) => notify(frame))
}

const subscribe = (listener: Listener): (() => void) => {
  listeners.add(listener)
  if (raf === 0) raf = requestAnimationFrame(tick)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      cancelAnimationFrame(raf)
      raf = 0
    }
  }
}

/**
 * The current beat of the shared glyph clock. Components re-render on every
 * beat, so keep what they do with it cheap.
 *
 * Returns a frozen zero when the reader asks for reduced motion, or when the
 * caller passes `active: false` because whatever it draws does not move. A
 * still caller never subscribes, so it costs nothing per beat.
 */
export function useGlyphFrame(active = true): number {
  const [beat, setBeat] = useState(0)

  useEffect(() => {
    if (!active) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    return subscribe(setBeat)
  }, [active])

  return beat
}
