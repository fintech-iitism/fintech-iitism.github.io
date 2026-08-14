import { useEffect, useRef } from 'react'

export interface AsciiGrid {
  cols: number
  rows: number
  /** Draw one glyph at a cell coordinate. */
  put: (col: number, row: number, ch: string, color?: string) => void
  /** Draw a run of glyphs starting at a cell coordinate. */
  text: (col: number, row: number, str: string, color?: string) => void
}

interface AsciiCanvasOptions {
  /** Monospace cell height in CSS pixels. */
  cellSize?: number
  /** Redraw rate. ASCII reads better stepped than smooth. */
  fps?: number
  /** Pause the loop while the panel is off screen. */
  active?: boolean
}

const INK = '#d8d8d8'

/**
 * Drives a monospace character grid on a canvas. Callers get `put`/`text` in
 * cell coordinates and never touch the 2D context: the hook owns the device
 * pixel ratio, resizing and the frame budget.
 *
 * Canvas rather than DOM text because a 100x18 grid is a couple of thousand
 * nodes to restyle every frame, and these sit behind body copy.
 */
export function useAsciiCanvas(
  render: (grid: AsciiGrid, t: number) => void,
  { cellSize = 11, fps = 12, active = true }: AsciiCanvasOptions = {},
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderRef = useRef(render)

  // The render callback closes over fresh props each commit, so it is swapped
  // in rather than restarting the loop.
  useEffect(() => {
    renderRef.current = render
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cw = cellSize * 0.6
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let cols = 0
    let rows = 0
    let frame = 0
    let painted = 0

    const grid: AsciiGrid = {
      get cols() {
        return cols
      },
      get rows() {
        return rows
      },
      put: (col, row, ch, color = INK) => {
        ctx.fillStyle = color
        ctx.fillText(ch, col * cw, row * cellSize)
      },
      text: (col, row, str, color = INK) => {
        ctx.fillStyle = color
        ctx.fillText(str, col * cw, row * cellSize)
      },
    }

    const size = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (w === 0 || h === 0) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = w * dpr
      canvas.height = h * dpr
      // Resizing the backing store wipes the context state, so the font and
      // baseline are set here rather than once up front.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.font = `500 ${cellSize}px "JetBrains Mono", monospace`
      ctx.textBaseline = 'top'
      cols = Math.floor(w / cw)
      rows = Math.floor(h / cellSize)
    }

    const paint = (t: number) => {
      if (cols === 0 || rows === 0) return
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
      renderRef.current(grid, t)
    }

    const tick = (t: number) => {
      frame = requestAnimationFrame(tick)
      if (t - painted < 1000 / fps) return
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
  }, [cellSize, fps, active])

  return canvasRef
}
