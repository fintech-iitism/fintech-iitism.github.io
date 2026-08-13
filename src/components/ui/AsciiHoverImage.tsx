import { useEffect, useRef } from 'react'

interface AsciiHoverImageProps {
  src: string
  alt?: string
  /** Monospace glyph size in CSS pixels. Smaller keeps more of the shape. */
  cellSize?: number
  /** Seconds the glyphs take to resolve in or out. */
  duration?: number
  /** Share of settled glyphs swapped for a new character each second. */
  flicker?: number
  /** Brightness multiplier on the sampled colors. Glyph ink covers roughly a
   *  third of its cell, so 1 reads much darker than the photo it replaces. */
  gain?: number
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

export function AsciiHoverImage({
  src,
  alt = '',
  cellSize = 10,
  duration = 1.2,
  flicker = 1.5,
  gain = 2.4,
  className = '',
}: AsciiHoverImageProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const apiRef = useRef<{ to: (target: number, px: number, py: number) => void } | null>(
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
    let image: HTMLImageElement | null = null
    let cells: Cell[] = []
    let progress = 0
    let target = 0
    let frame = 0
    let lastT = 0
    let originX = 0
    let originY = 0
    let reach = 1

    const draw = (p: number) => {
      ctx.clearRect(0, 0, wrap.clientWidth, wrap.clientHeight)
      // 500 weight lays down more ink per cell, closer in mass to the photo.
      ctx.font = `500 ${cellSize}px "JetBrains Mono", monospace`
      ctx.textBaseline = 'top'

      for (const cell of cells) {
        // Each glyph owns a window inside the transition, so the field resolves
        // in a scatter rather than all at once.
        const local = Math.min(1, Math.max(0, (p - cell.delay * 0.5) / 0.5))
        if (local <= 0) continue

        ctx.globalAlpha = local * cell.alpha
        ctx.fillStyle = cell.color
        ctx.fillText(cell.ch, cell.x, cell.y)
      }

      ctx.globalAlpha = 1

      // Erase the photo behind the glyph front, never ahead of it. A cell at
      // distance ratio u starts at p = 0.425u and finishes at 0.425u + 0.5;
      // these radii clear that same spot slightly later, so the two layers
      // overlap instead of leaving a dark gap in the transition band.
      const inner = Math.min(1, Math.max(0, (p - 0.55) / 0.45)) * reach * 1.02
      const outer = Math.min(1, Math.max(0, p / 0.45)) * reach * 1.02
      const mask = `radial-gradient(circle at ${originX}px ${originY}px, transparent ${inner}px, black ${outer}px)`
      imgEl.style.maskImage = mask
      imgEl.style.webkitMaskImage = mask
    }

    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - lastT) / 1000)
      lastT = t

      const step = dt / Math.max(0.05, duration)
      progress =
        target > progress
          ? Math.min(target, progress + step)
          : Math.max(target, progress - step)

      for (const cell of cells) {
        const local = Math.min(1, Math.max(0, (progress - cell.delay * 0.5) / 0.5))
        // Mid-resolve cells churn every frame, then lock to their character.
        if (local > 0 && local < 1) cell.ch = pick(cell.set)
      }

      // Settled glyphs keep swapping, so the artwork never freezes while hovered.
      const swaps = Math.round(cells.length * flicker * dt * progress)
      for (let n = 0; n < swaps; n++) {
        const cell = cells[(Math.random() * cells.length) | 0]!
        cell.ch = pick(cell.set)
      }

      draw(progress)
      // Keep running while hovered to sustain the flicker.
      frame = progress === target && target === 0 ? 0 : requestAnimationFrame(tick)
    }

    const build = () => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      if (!image || w === 0 || h === 0) return

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

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
        const r = sr * k
        const g = sg * k
        const b = sb * k
        const lum = (sr * 0.299 + sg * 0.587 + sb * 0.114) / 255
        const set = RAMP[Math.min(RAMP.length - 1, (lum * 1.35 * RAMP.length) | 0)]!
        if (set === ' ') continue

        cells.push({
          ch: pick(set),
          set,
          x: (i % cols) * cw,
          y: ((i / cols) | 0) * ch,
          // Replaced on hover by the distance from the pointer.
          delay: Math.random(),
          alpha,
          color: `rgb(${r | 0} ${g | 0} ${b | 0})`,
        })
      }

      draw(progress)
    }

    /** Order the cells by distance from the pointer, so the effect spreads out
     *  from where the cursor touched the artwork. */
    const stagger = (px: number, py: number) => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      originX = px
      originY = py
      // Farthest reachable corner from this point sets the normalising range.
      reach = Math.hypot(Math.max(px, w - px), Math.max(py, h - py)) || 1

      for (const cell of cells) {
        const d = Math.hypot(cell.x - px, cell.y - py) / reach
        cell.delay = Math.min(0.85, d * 0.85 + Math.random() * 0.15)
      }
    }

    apiRef.current = {
      to: (next: number, px: number, py: number) => {
        target = next
        stagger(px, py)
        if (frame === 0) {
          lastT = performance.now()
          frame = requestAnimationFrame(tick)
        }
      },
    }

    const img = new Image()
    img.src = src
    img.decode().then(
      () => {
        image = img
        build()
      },
      () => undefined,
    )

    const observer = new ResizeObserver(build)
    observer.observe(wrap)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [src, cellSize, duration, flicker, gain])

  return (
    <div
      ref={wrapRef}
      className={`pointer-events-auto ${className}`}
      onPointerEnter={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        apiRef.current?.to(1, e.clientX - rect.left, e.clientY - rect.top)
      }}
      onPointerLeave={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        apiRef.current?.to(0, e.clientX - rect.left, e.clientY - rect.top)
      }}
    >
      <img ref={imgRef} src={src} alt={alt} className="block w-full" />
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
    </div>
  )
}
