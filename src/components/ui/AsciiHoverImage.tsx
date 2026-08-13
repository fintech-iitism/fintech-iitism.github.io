import { useEffect, useRef, type PointerEvent } from 'react'

interface AsciiHoverImageProps {
  src: string
  alt?: string
  /** Monospace glyph size in CSS pixels. Smaller keeps more of the shape. */
  cellSize?: number
  /** Radius of the photo spotlight under the cursor, in CSS pixels. */
  revealRadius?: number
  /** Share of glyphs swapped for a new character each second. */
  flicker?: number
  /** Brightness multiplier on the sampled colors. Glyph ink covers roughly a
   *  third of its cell, so 1 reads much darker than the photo. */
  gain?: number
  /** Seconds the ASCII takes to assemble on load. */
  duration?: number
  /** Seconds to wait before the ASCII assembles. */
  introDelay?: number
  /** Edge the load sweep starts from. */
  introFrom?: 'left' | 'right' | 'top' | 'bottom'
  /** Must include a positioning class (`absolute` or `relative`): the canvas
   *  is positioned against this wrapper. */
  className?: string
}

interface Cell {
  ch: string
  set: string
  x: number
  y: number
  delay: number
  alpha: number
  color: string
}

// Character ramp from dark to bright. A random pick per cell keeps it noisy.
const RAMP = [' ', '.,:', ";~-'", '=+<>|!', 'vxnjzsc1', 'VXNJZ48', 'MW0@#$%&']

const pick = (set: string): string => set[(Math.random() * set.length) | 0]!

// A cell fades over WINDOW of the load run; delays spread across SPREAD.
const WINDOW = 0.18
const SPREAD = 0.82
// Share of a cell's delay from its position rather than chance. Lower values
// dissolve, higher values wipe.
const DIRECTED = 0.55
// Seconds for the spotlight to open or close.
const FADE = 0.25
// Frames per second while idle, when only the character flicker is moving.
const IDLE_FPS = 12

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v)

export function AsciiHoverImage({
  src,
  alt = '',
  cellSize = 10,
  revealRadius = 90,
  flicker = 1.5,
  gain = 2.4,
  duration = 1.2,
  introDelay = 0.4,
  introFrom = 'top',
  className = '',
}: AsciiHoverImageProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const apiRef = useRef<{ move: (x: number, y: number) => void; show: (on: boolean) => void } | null>(
    null,
  )

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    const imgEl = imgRef.current
    if (!wrap || !canvas || !imgEl) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cw = cellSize * 0.6
    const ch = cellSize
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Offscreen plate holds the photo clipped to the spotlight.
    const plate = document.createElement('canvas')
    const pctx = plate.getContext('2d')

    let image: HTMLImageElement | null = null
    let cells: Cell[] = []
    let assembled = still ? 1 : 0 // load progress of the ASCII
    let reveal = 0 // spotlight strength
    let revealTarget = 0
    let cursorX = 0
    let cursorY = 0
    let frame = 0
    let lastT = 0
    let painted = 0
    let holdUntil = 0
    // The loop starts after an async decode, which can land after cleanup has
    // already run. Without this the orphaned loop keeps ticking and its swaps
    // stack on top of the live one.
    let dead = false

    const draw = () => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      ctx.clearRect(0, 0, w, h)
      // 500 weight lays down more ink per cell, closer in mass to the photo.
      ctx.font = `500 ${cellSize}px "JetBrains Mono", monospace`
      ctx.textBaseline = 'top'

      for (const cell of cells) {
        const local = clamp01((assembled - cell.delay) / WINDOW)
        if (local <= 0) continue
        ctx.globalAlpha = local * cell.alpha
        ctx.fillStyle = cell.color
        ctx.fillText(cell.ch, cell.x, cell.y)
      }
      ctx.globalAlpha = 1

      if (reveal <= 0.001 || !image || !pctx) return

      // Photo clipped to a soft circle, then laid over the glyphs. Drawing it
      // opaque means no half-and-half blend can darken the edge.
      const r = revealRadius * (0.65 + 0.35 * reveal)
      pctx.clearRect(0, 0, w, h)
      pctx.drawImage(image, 0, 0, w, h)
      pctx.globalCompositeOperation = 'destination-in'
      const fade = pctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, r)
      fade.addColorStop(0, `rgba(0,0,0,${reveal})`)
      fade.addColorStop(0.6, `rgba(0,0,0,${reveal * 0.92})`)
      fade.addColorStop(1, 'rgba(0,0,0,0)')
      pctx.fillStyle = fade
      pctx.fillRect(0, 0, w, h)
      pctx.globalCompositeOperation = 'source-over'

      ctx.drawImage(plate, 0, 0, w, h)
    }

    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - lastT) / 1000)
      lastT = t

      if (t >= holdUntil && assembled < 1) {
        assembled = Math.min(1, assembled + dt / Math.max(0.05, duration))
      }

      const fadeStep = dt / FADE
      reveal =
        revealTarget > reveal
          ? Math.min(revealTarget, reveal + fadeStep)
          : Math.max(revealTarget, reveal - fadeStep)

      for (const cell of cells) {
        const local = (assembled - cell.delay) / WINDOW
        // Cells churn as they land, then settle into their character.
        if (local > 0 && local < 1) cell.ch = pick(cell.set)
      }

      const swaps = Math.round(cells.length * flicker * dt * assembled)
      for (let n = 0; n < swaps; n++) {
        const cell = cells[(Math.random() * cells.length) | 0]!
        cell.ch = pick(cell.set)
      }

      // Full rate while anything is animating, throttled when only flickering.
      const busy = assembled < 1 || reveal !== revealTarget || revealTarget > 0
      if (busy || t - painted > 1000 / IDLE_FPS) {
        painted = t
        draw()
      }
      frame = requestAnimationFrame(tick)
    }

    const build = () => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      if (!image || w === 0 || h === 0) return

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      for (const c of [canvas, plate]) {
        c.width = w * dpr
        c.height = h * dpr
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      pctx?.setTransform(dpr, 0, 0, dpr, 0, 0)

      const cols = Math.ceil(w / cw)
      const rows = Math.ceil(h / ch)

      // Downsample the artwork to one pixel per character cell.
      const off = document.createElement('canvas')
      off.width = cols
      off.height = rows
      const ictx = off.getContext('2d', { willReadFrequently: true })
      if (!ictx) return
      ictx.drawImage(image, 0, 0, cols, rows)
      const { data } = ictx.getImageData(0, 0, cols, rows)

      // Nearest edge to the load origin, and the sweep runs away from it.
      const ax = introFrom === 'left' ? 1 : introFrom === 'right' ? -1 : 0
      const ay = introFrom === 'top' ? 1 : introFrom === 'bottom' ? -1 : 0
      const span = Math.abs(w * ax) + Math.abs(h * ay) || 1
      const ox = ax >= 0 ? 0 : w
      const oy = ay >= 0 ? 0 : h

      cells = []
      for (let i = 0; i < cols * rows; i++) {
        const p = i * 4
        const alpha = data[p + 3]! / 255
        // Transparent cutout stays empty, so the silhouette survives.
        if (alpha < 0.35) continue

        const sr = data[p]!
        const sg = data[p + 1]!
        const sb = data[p + 2]!
        // Scale all three channels by one factor, capped so none clips. Per
        // channel clamping would brighten unevenly and shift the hue.
        const k = Math.min(gain, 255 / (Math.max(sr, sg, sb) || 1))
        const lum = (sr * 0.299 + sg * 0.587 + sb * 0.114) / 255
        const set = RAMP[Math.min(RAMP.length - 1, (lum * 1.35 * RAMP.length) | 0)]!
        if (set === ' ') continue

        const x = (i % cols) * cw
        const y = ((i / cols) | 0) * ch
        const t = ((x - ox) * ax + (y - oy) * ay) / span
        cells.push({
          ch: pick(set),
          set,
          x,
          y,
          // Direction sets the trend, randomness hides the edge.
          delay: SPREAD * clamp01(DIRECTED * clamp01(t) + (1 - DIRECTED) * Math.random()),
          alpha,
          color: `rgb(${(sr * k) | 0} ${(sg * k) | 0} ${(sb * k) | 0})`,
        })
      }

      // The canvas paints everything now; the element only holds the box open.
      imgEl.style.visibility = 'hidden'
      draw()
    }

    apiRef.current = {
      move: (x, y) => {
        cursorX = x
        cursorY = y
      },
      show: (on) => {
        revealTarget = on ? 1 : 0
      },
    }

    const img = new Image()
    img.src = src
    img.decode().then(
      () => {
        if (dead) return
        image = img
        build()
        holdUntil = performance.now() + introDelay * 1000
        lastT = performance.now()
        frame = requestAnimationFrame(tick)
      },
      () => undefined,
    )

    const observer = new ResizeObserver(build)
    observer.observe(wrap)

    return () => {
      dead = true
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [src, cellSize, revealRadius, flicker, gain, duration, introDelay, introFrom])

  const track = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    apiRef.current?.move(e.clientX - rect.left, e.clientY - rect.top)
  }

  return (
    <div
      ref={wrapRef}
      className={`pointer-events-auto ${className}`}
      onPointerEnter={(e) => {
        track(e)
        apiRef.current?.show(true)
      }}
      onPointerMove={track}
      onPointerLeave={() => apiRef.current?.show(false)}
    >
      <img ref={imgRef} src={src} alt={alt} className="block w-full" />
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
    </div>
  )
}
