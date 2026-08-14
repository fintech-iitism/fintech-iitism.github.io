import { useEffect, useRef } from 'react'

// Bayer 8x8 threshold map, normalised to 0..1. Ordered rather than error
// diffused: the pattern is stable and tiles, which is what makes it read as
// deliberate pixel art instead of noise.
const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36,
  14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23,
  61, 29, 53, 21,
].map((v) => (v + 0.5) / 64)

// CSS pixels per dither block. The canvas is rendered one pixel per block and
// stretched, so this is what sets how chunky the texture reads.
const BLOCK = 4

// Redraws per second. Deliberately low: the blocks are meant to step from one
// state to the next, the same way the ASCII sims do, and a smooth 60fps wash
// would read as a video rather than as pixel art.
const FPS = 12

// The ramp the gradient is quantised onto, darkest first. Few enough steps that
// the dither between them stays visible.
const TONES: readonly (readonly [number, number, number])[] = [
  [17, 17, 17],
  [22, 22, 22],
  [27, 27, 27],
  [33, 33, 33],
  [40, 40, 40],
]

// var(--color-brand), which the pool in the bottom corner pulls its tones
// toward. Hardcoded because the field is computed per pixel, not styled.
const BRAND = [95, 184, 122] as const

// Widths of the two light sources, and how hard each falls off. The pool is
// broad and soft, because it crosses the middle of the page rather than sitting
// in a corner: a tight one would read as a blob tracking across the screen.
const GLOW_X = 1.3
const GLOW_FALL = 3.4
const POOL_X = 1
const POOL_Y = 1.3
const POOL_FALL = 8

// How far toward brand the pool pulls the tones at its centre. Low on purpose:
// the brand colour is the accent the cards and rules spend, so the backdrop
// only ever hints at it.
const TINT = 0.09

// Multiplier on every drift rate below. One knob for the whole thing, so the
// cycles keep their relative rates and never fall into step with each other.
const SPEED = 3

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v)

/**
 * Fixed backdrop behind every page: a soft gradient quantised onto five dark
 * tones with an ordered dither, so the wash is built out of visible blocks in
 * the same language as the pixel frames and the ASCII sims.
 *
 * Painted into a canvas at one pixel per block and upscaled with
 * `image-rendering: pixelated`, which is what keeps the blocks hard edged.
 *
 * The two light sources drift on long sine cycles. Nothing about the drift is
 * fast enough to see directly; what moves is the dither boundary, which flips
 * whole blocks between tones as the field slides under the threshold map.
 */
export function PixelBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let cols = 0
    let rows = 0
    let img: ImageData | null = null
    // Both gaussians separate into an x term and a y term, so each frame builds
    // four 1D tables and the pixel loop only multiplies. Without this the loop
    // would run a quarter of a million exp() calls per frame.
    let glowX = new Float32Array(0)
    let glowY = new Float32Array(0)
    let poolX = new Float32Array(0)
    let poolY = new Float32Array(0)
    let fall = new Float32Array(0)
    let frame = 0
    let painted = 0

    const size = () => {
      const nextCols = Math.max(1, Math.ceil(window.innerWidth / BLOCK))
      const nextRows = Math.max(1, Math.ceil(window.innerHeight / BLOCK))
      if (nextCols === cols && nextRows === rows) return

      cols = nextCols
      rows = nextRows
      canvas.width = cols
      canvas.height = rows
      img = ctx.createImageData(cols, rows)
      glowX = new Float32Array(cols)
      poolX = new Float32Array(cols)
      glowY = new Float32Array(rows)
      poolY = new Float32Array(rows)
      fall = new Float32Array(rows)
      for (let y = 0; y < rows; y++) fall[y] = (y / rows) * 0.13
    }

    const paint = (t: number) => {
      if (!img) return
      const { data } = img
      const levels = TONES.length - 1

      // Centres and strengths, on cycles that share no common multiple, so no
      // two ever line up into an obvious pulse.
      const s = t * SPEED
      const gcx = 0.5 + Math.sin(s * 0.17) * 0.17
      const gcy = -0.1 + Math.sin(s * 0.11 + 1.1) * 0.05
      const gAmp = 0.66 + Math.sin(s * 0.13 + 0.4) * 0.05
      // The brand pool travels the page on a Lissajous path: the two axes run
      // at unrelated rates, so it never repeats a visible loop. At SPEED 3 it
      // crosses the page in about twenty seconds.
      const pcx = 0.5 + Math.sin(s * 0.09) * 0.4
      const pcy = 0.58 + Math.sin(s * 0.13 + 1.7) * 0.34
      const pAmp = 0.42 + Math.sin(s * 0.1 + 3) * 0.05

      for (let x = 0; x < cols; x++) {
        const u = x / cols
        const gx = (u - gcx) * GLOW_X
        const px = (u - pcx) * POOL_X
        glowX[x] = Math.exp(-gx * gx * GLOW_FALL)
        poolX[x] = Math.exp(-px * px * POOL_FALL)
      }
      for (let y = 0; y < rows; y++) {
        const v = y / rows
        const gy = v - gcy
        const py = (v - pcy) * POOL_Y
        glowY[y] = Math.exp(-gy * gy * GLOW_FALL)
        poolY[y] = Math.exp(-py * py * POOL_FALL)
      }

      for (let y = 0; y < rows; y++) {
        const gY = glowY[y]!
        const pY = poolY[y]!
        const drop = fall[y]!
        const bayerRow = (y & 7) * 8
        const row = y * cols

        for (let x = 0; x < cols; x++) {
          const pool = poolX[x]! * pY
          const lift = glowX[x]! * gY * gAmp
          const tint = pool * pAmp
          // Screen rather than add: where the travelling pool crosses the top
          // glow, a sum would clip, and a clipped region holds one tone flat
          // with no dither in it at all.
          const lum = clamp01(0.14 + (lift + tint - lift * tint) - drop)

          // Quantise to the ramp, and let the threshold map decide which way
          // the leftover fraction rounds. That choice is the dither.
          const q = lum * levels
          let step = Math.floor(q)
          if (q - step > BAYER[bayerRow + (x & 7)]!) step++
          const tone = TONES[step < 0 ? 0 : step > levels ? levels : step]!

          // Tint toward brand inside the pool, so the wash carries the club's
          // colour without breaking out of the ramp.
          const k = pool * TINT
          const p = (row + x) * 4
          data[p] = tone[0]! + (BRAND[0] - tone[0]!) * k
          data[p + 1] = tone[1]! + (BRAND[1] - tone[1]!) * k
          data[p + 2] = tone[2]! + (BRAND[2] - tone[2]!) * k
          data[p + 3] = 255
        }
      }

      ctx.putImageData(img, 0, 0)
    }

    const tick = (ms: number) => {
      frame = requestAnimationFrame(tick)
      if (ms - painted < 1000 / FPS) return
      painted = ms
      paint(ms / 1000)
    }

    size()

    // Resize is handled inside the loop, so a drag does not queue a repaint per
    // event; it only ever costs the reallocation when the block count changes.
    const onResize = () => {
      size()
      if (still) paint(0)
    }
    window.addEventListener('resize', onResize)

    if (still) paint(0)
    else frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 bg-ink"
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  )
}
