import { useCallback, useMemo, useRef } from 'react'
import { useInView } from 'motion/react'
import { useMarketData } from '../../../hooks/useMarketData'
import { createBrailleLayer } from './braille'
import { useAsciiCanvas, type AsciiGrid } from './useAsciiCanvas'

const FILL = 'rgba(95,184,122,0.45)'
const CREST = '#5fb87a'
const CURVE = '#d9a441'
const AXIS = 'rgba(255,255,255,0.30)'
const LABEL = 'rgba(255,255,255,0.85)'

// Rows the header block occupies. Its two lines sit on every other row: at
// this cell size consecutive rows crowd into a single slab of text.
const HEAD = 4
const GUTTER = 8
// Half width of the plotted range, in standard deviations.
const SPAN = 3.4
// Draws per frame, and the decay applied before them. Together they set the
// effective sample window: short enough that bin counts visibly wobble from
// frame to frame, long enough that the shape stays a bell.
const DRAWS = 70
const DECAY = 0.97
// Draws folded in when the grid is first sized, so the histogram opens at a
// recognisable bell rather than building up from nothing.
const WARM = 3000

/** Sum of three uniforms, rescaled to unit variance. */
const gaussian = (): number => (Math.random() + Math.random() + Math.random() - 1.5) * 2

/** Log returns of a price series, standardised to zero mean and unit sd. */
const standardisedReturns = (prices: readonly number[]): number[] => {
  const r: number[] = []
  for (let i = 1; i < prices.length; i++) r.push(Math.log(prices[i]! / prices[i - 1]!))
  if (r.length < 2) return r

  const mean = r.reduce((a, b) => a + b, 0) / r.length
  const sd = Math.sqrt(r.reduce((a, b) => a + (b - mean) ** 2, 0) / r.length)
  return sd > 0 ? r.map((v) => (v - mean) / sd) : r
}

/**
 * Bootstrap of the last day of real returns: each frame draws a fresh batch
 * with replacement and folds it into a decaying histogram, with the fitted
 * normal laid over the top. Where the crest sits above the amber curve in the
 * tails, that is the real series being fatter tailed than normal.
 *
 * Falls back to sampling a normal outright until the prices arrive.
 */
export function MonteCarlo() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const active = useInView(wrapRef, { amount: 0.3 })
  const market = useMarketData()

  const bins = useRef<number[]>([])
  const bootstrapping = useRef(false)

  // Recomputed only when a new series lands, not per frame.
  const returns = useMemo(
    () => (market ? standardisedReturns(market.prices) : []),
    [market],
  )

  const render = useCallback(
    (g: AsciiGrid) => {
      const live = returns.length > 30
      const sample = (): number =>
        live ? returns[(Math.random() * returns.length) | 0]! : gaussian()
  
      const top = HEAD
      const base = g.rows - 1
      const plotRows = base - top
      const plotCols = g.cols - GUTTER
      // One bin per character column, drawn two dots wide. Finer than that and
      // the counts get too thin to hold a bell.
      const nbins = plotCols
      if (plotRows < 6 || nbins < 10) return
  
      /** Bin index for a draw, or -1 for the tails outside the plotted range. */
      const binOf = (x: number): number => {
        const i = Math.floor(((x + SPAN) / (SPAN * 2)) * nbins)
        // Tails past the range are dropped rather than piled on the edge bin,
        // which would put a false spike at both ends.
        return i >= 0 && i < nbins ? i : -1
      }
      const xOf = (i: number): number => ((i + 0.5) / nbins - 0.5) * SPAN * 2
  
      const draw = (n: number) => {
        for (let k = 0; k < n; k++) {
          const i = binOf(sample())
          if (i >= 0) bins.current[i]!++
        }
      }
  
      // Rebuild on a resize, and again when the real returns arrive and the
      // draws stop coming from the fallback normal.
      if (bins.current.length !== nbins || bootstrapping.current !== live) {
        bootstrapping.current = live
        bins.current = new Array<number>(nbins).fill(0)
        draw(WARM)
      }
  
      const counts = bins.current
      for (let i = 0; i < nbins; i++) counts[i]! *= DECAY
      draw(DRAWS)
  
      let peak = 0
      let total = 0
      let sum = 0
      for (let i = 0; i < nbins; i++) {
        const w = counts[i]!
        if (w > peak) peak = w
        total += w
        sum += w * xOf(i)
      }
      if (peak <= 0 || total <= 0) return
  
      const mean = sum / total
      let variance = 0
      for (let i = 0; i < nbins; i++) variance += counts[i]! * (xOf(i) - mean) ** 2
      const sd = Math.sqrt(variance / total)
  
      g.text(0, 0, live ? `BOOTSTRAP ${market?.symbol ?? ''} 24H` : 'MONTE CARLO', CREST)
      g.text(0, 2, `μ ${mean >= 0 ? '+' : ''}${mean.toFixed(3)}  σ ${sd.toFixed(3)}`, LABEL)
  
      // Density scale down the left edge, as a share of the peak bin. Numbers
      // every other row, rule on all of them.
      for (let r = 0; r < plotRows; r++) {
        if (r % 2 === 0) {
          const share = (1 - r / (plotRows - 1)) * (peak / total) * 100
          g.text(0, top + r, `${share.toFixed(1)}%`.padStart(GUTTER - 2), AXIS)
        }
        g.put(GUTTER - 1, top + r, '|', AXIS)
      }
  
      const dots = createBrailleLayer(plotCols, plotRows)
      const floor = dots.dotRows - 1
  
      for (let i = 0; i < nbins; i++) {
        const x = i * 2
        const height = Math.round((counts[i]! / peak) * floor)
  
        // Dotted stem under the crest rather than a solid bar: one dot per
        // character row keeps the fill readable as ASCII.
        for (let h = 0; h < height; h += 4) dots.plot(x, floor - h, FILL)
        dots.plot(x, floor - height, CREST)
        dots.plot(x + 1, floor - height, CREST)
  
        // Unit normal scaled to the same peak, so shape is comparable by eye.
        // On the odd dot column only, which dashes it against the crest.
        const pdf = Math.exp(-0.5 * xOf(i) ** 2)
        dots.plot(x + 1, floor - Math.round(pdf * floor), CURVE)
      }
  
      dots.flush(g, GUTTER, top)
  
      // Baseline with a tick every whole standard deviation.
      for (let i = 0; i < plotCols; i++) {
        const x = ((i + 0.5) / plotCols - 0.5) * SPAN * 2
        const near = Math.abs(x - Math.round(x)) < SPAN / plotCols
        g.put(GUTTER + i, base, near ? '+' : '-', AXIS)
      }
    },
    [returns, market],
  )

  const canvasRef = useAsciiCanvas(render, { cellSize: 11, fps: 10, active })

  return (
    <div ref={wrapRef} className="h-full min-h-56 w-full">
      <canvas ref={canvasRef} aria-hidden="true" className="block h-full w-full" />
    </div>
  )
}
