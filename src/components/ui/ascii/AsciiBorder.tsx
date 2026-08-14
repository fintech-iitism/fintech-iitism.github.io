import { useEffect, useRef } from 'react'
import type { AsciiVariant } from './frameStyle'
import {
  DENSE,
  DRIFT,
  DRIFT_RATE,
  PULSE_PACKET,
  PULSE_SPEED,
  from,
  rand,
} from './glyphs'

interface AsciiBorderProps {
  /** Which glyph treatment to draw. */
  variant: AsciiVariant
  /** Run the flicker. False paints one still frame. */
  active: boolean
  /** Pointer is over the box: the whole border takes the brand colour. */
  hot: boolean
  /** Glyph size in CSS pixels. Also the width of the border ring. */
  cellSize?: number
}

const REST = 'rgba(255,255,255,0.35)'
const HOT = '#5fb87a'

/** Redraws per second. Matches the shared clock the text rules step on. */
const FPS = 10

/**
 * Draws a box's border as a ring of monospace glyphs on a canvas covering the
 * box. Only the outermost cells are painted, so the middle stays clear for the
 * content underneath, and the canvas is inert to the pointer.
 *
 * Canvas rather than four strings of DOM text: the ring is a couple of hundred
 * characters, and rewriting that many text nodes ten times a second on every
 * card of the members grid is the one thing this effect cannot afford. It also
 * does not use `useAsciiCanvas`, which lays out from the top left and leaves
 * whatever does not divide evenly as slack at the right and bottom. A border
 * has to touch all four edges, so the cell pitch here is stretched to fit the
 * box exactly.
 */
export function AsciiBorder({
  variant,
  active,
  hot,
  cellSize = 10,
}: AsciiBorderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Read inside the loop so a hover recolours the next frame without the
  // effect tearing down and restarting.
  const look = useRef({ variant, hot })
  useEffect(() => {
    look.current = { variant, hot }
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let cols = 0
    let rows = 0
    let cw = 0
    let ch = 0
    let frame = 0
    let painted = 0

    const size = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (w === 0 || h === 0) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = w * dpr
      canvas.height = h * dpr
      // Resizing the backing store wipes the context state, so the font is set
      // here rather than once up front.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.font = `500 ${cellSize}px "JetBrains Mono", monospace`
      ctx.textBaseline = 'top'
      cols = Math.max(2, Math.round(w / (cellSize * 0.6)))
      rows = Math.max(2, Math.round(h / cellSize))
      cw = w / cols
      ch = h / rows
    }

    /** The ring walked clockwise, so the pulse has one axis to travel along. */
    const walk = (): [number, number][] => {
      const ring: [number, number][] = []
      for (let c = 0; c < cols; c++) ring.push([c, 0])
      for (let r = 1; r < rows; r++) ring.push([cols - 1, r])
      for (let c = cols - 2; c >= 0; c--) ring.push([c, rows - 1])
      for (let r = rows - 2; r >= 1; r--) ring.push([0, r])
      return ring
    }

    const paint = (t: number) => {
      if (cols < 2 || rows < 2) return
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)

      const ring = walk()
      // Time in whole frames, so the ring rolls its glyphs on one beat rather
      // than shimmering continuously.
      const step = Math.floor((t / 1000) * FPS)
      const head = ((t / 1000) * PULSE_SPEED * ring.length) % ring.length
      const { variant: look_, hot: lit } = look.current

      ring.forEach(([c, r], i) => {
        const corner = (c === 0 || c === cols - 1) && (r === 0 || r === rows - 1)
        const base = corner ? '+' : r === 0 || r === rows - 1 ? '-' : '|'

        let glyph = base
        let color = lit ? HOT : REST

        if (look_ === 'noise') {
          glyph = from(DENSE, rand(i * 3.1 + step))
        } else if (look_ === 'pulse') {
          if ((i - head + ring.length) % ring.length < PULSE_PACKET) {
            glyph = from(DENSE, rand(i * 5.7 + step))
            color = HOT
          }
        } else if (!corner && rand(i * 7.3 + step) < DRIFT_RATE) {
          glyph = from(DRIFT, rand(i * 2.9 + step + 1))
        }

        ctx.fillStyle = color
        ctx.fillText(glyph, c * cw, r * ch)
      })
    }

    const tick = (t: number) => {
      frame = requestAnimationFrame(tick)
      if (t - painted < 1000 / FPS) return
      painted = t
      paint(t)
    }

    size()

    const observer = new ResizeObserver(() => {
      size()
      paint(performance.now())
    })
    observer.observe(canvas)

    if (active && !still) frame = requestAnimationFrame(tick)
    else paint(performance.now())

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [cellSize, active, variant, hot])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  )
}
