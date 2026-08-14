import { useCallback, useRef } from 'react'
import { useInView } from 'motion/react'
import { useMarketData } from '../../../hooks/useMarketData'
import { createBrailleLayer } from './braille'
import { useAsciiCanvas, type AsciiGrid } from './useAsciiCanvas'

const UP = '#5fb87a'
const DOWN = '#e0574f'
// The two reference lines sit well under the price line in weight. At equal
// strength three crossing series read as speckle rather than as a chart.
const TREND = 'rgba(217,164,65,0.55)'
const SLOW = 'rgba(255,255,255,0.14)'
const AXIS = 'rgba(255,255,255,0.30)'
const LABEL = 'rgba(255,255,255,0.85)'

// Rows the header block occupies. Its two lines sit on every other row: at
// this cell size consecutive rows crowd into a single slab of text.
const HEAD = 4
// Columns reserved for the price scale and its rule.
const GUTTER = 9
// Rows reserved under the plot: the time axis and its labels.
const FOOT = 2
// Frames between steps, so the tape crawls rather than races.
const ADVANCE = 7
// Window of the amber moving average, and the pull of the dim slow line. Both
// count in samples, and braille puts two samples in every character column.
const MA = 20
const EMA = 0.025

// Fallback tape, used only until the live series lands and if it never does.
// It carries the club's own initials so a synthetic walk is never labelled as
// a real listing.
const FALLBACK = 'FTC'
const BASE = 255.8
const VOL = 0.055

/** Sum of three uniforms: a cheap bell without a Box-Muller transform. */
const shock = (): number => Math.random() + Math.random() + Math.random() - 1.5

const hhmm = (ms: number): string => {
  const d = new Date(ms)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/**
 * Intraday tape in braille dots, with a moving average and a slower line under
 * it. Draws the last 24 hours of real prices, panning a window across the
 * series so the chart moves without anything being faked, and falls back to a
 * random walk while the request is in flight or if it fails.
 */
export function TickerChart() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const active = useInView(wrapRef, { amount: 0.3 })
  const market = useMarketData()

  const price = useRef(BASE)
  const walk = useRef<number[]>([])
  const frames = useRef(0)

  const render = useCallback(
    (g: AsciiGrid) => {
      const top = HEAD
      const plotRows = g.rows - top - FOOT
      const plotCols = g.cols - GUTTER
      const axisRow = top + plotRows
      if (plotRows < 6 || plotCols < 16) return

      const dots = createBrailleLayer(plotCols, plotRows)
      // One sample per braille dot column.
      const points = dots.dotCols
      const step = frames.current++ / ADVANCE

      let data: number[]
      let stamps: number[] | null = null
      let symbol = FALLBACK

      if (market && market.prices.length > points) {
        // Pan a window across the real series and wrap at the end. Every
        // sample drawn is a price that actually printed.
        const span = market.prices.length - points
        const head = Math.floor(step) % (span + 1)
        data = market.prices.slice(head, head + points)
        stamps = market.times.slice(head, head + points)
        symbol = market.symbol
      } else {
        const next = (): number => {
          price.current += (BASE - price.current) * 0.004 + shock() * VOL
          return price.current
        }
        // Fill the whole plot up front. One sample per frame would leave the
        // chart as a half drawn strip for several seconds.
        while (walk.current.length < points) walk.current.push(next())
        if (frames.current % ADVANCE === 0) walk.current.push(next())
        while (walk.current.length > points) walk.current.shift()
        data = walk.current
      }

      let lo = Infinity
      let hi = -Infinity
      for (const v of data) {
        if (v < lo) lo = v
        if (v > hi) hi = v
      }
      // Just enough headroom to keep the line off the frame, and a floor so a
      // flat stretch cannot divide by zero and pin every dot to one row.
      const pad = Math.max(0.02, (hi - lo) * 0.06)
      lo -= pad
      hi += pad

      const rowOf = (v: number): number =>
        Math.round((1 - (v - lo) / (hi - lo)) * (dots.dotRows - 1))

      /**
       * Draws a series as a continuous line in braille dots, bridging the dots
       * a step jumps over. Without the bridge a fast move leaves it in clumps.
       */
      const stroke = (values: readonly (number | null)[], color: string) => {
        let prev: number | null = null
        for (let x = 0; x < values.length; x++) {
          const v = values[x]
          if (v == null) {
            prev = null
            continue
          }
          const y = rowOf(v)
          const from = prev ?? y
          for (let d = Math.min(from, y); d <= Math.max(from, y); d++) dots.plot(x, d, color)
          prev = y
        }
      }

      const last = data[data.length - 1]!
      const first = data[0]!
      const diff = last - first
      const rising = diff >= 0
      const tint = rising ? UP : DOWN
      // Crypto runs to five figures, equities to three, so the scale picks its
      // precision from the range rather than always printing cents.
      const dp = hi - lo > 50 ? 0 : 2

      g.text(0, 0, symbol, UP)
      g.text(symbol.length + 1, 0, `$${last.toFixed(dp)}`, LABEL)
      g.text(
        0,
        2,
        `${rising ? '+' : ''}${diff.toFixed(dp)} (${rising ? '+' : ''}${((diff / first) * 100).toFixed(2)}%)`,
        tint,
      )

      // Price scale down the left edge. The rule runs every row, the numbers
      // every other one, so the gutter does not turn into a wall of digits.
      for (let r = 0; r < plotRows; r++) {
        if (r % 2 === 0) {
          const v = hi - (r / (plotRows - 1)) * (hi - lo)
          g.text(0, top + r, v.toFixed(dp).padStart(GUTTER - 2), AXIS)
        }
        g.put(GUTTER - 1, top + r, '|', AXIS)
      }

      const slow: (number | null)[] = []
      const mean: (number | null)[] = []
      let ema = data[0]!
      for (let i = 0; i < data.length; i++) {
        ema += (data[i]! - ema) * EMA
        slow.push(ema)
        if (i < MA) {
          mean.push(null)
          continue
        }
        let sum = 0
        for (let n = 0; n < MA; n++) sum += data[i - n]!
        mean.push(sum / MA)
      }

      stroke(slow, SLOW)
      stroke(mean, TREND)
      stroke(data, tint)
      dots.flush(g, GUTTER, top)

      // Time axis along the bottom, ticked and labelled off the real stamps
      // where there are any.
      const tick = Math.max(10, Math.round(plotCols / 6))
      g.put(GUTTER - 1, axisRow, '+', AXIS)
      for (let i = 0; i < plotCols; i++) {
        g.put(GUTTER + i, axisRow, i % tick === 0 && i > 0 ? '+' : '-', AXIS)
      }
      for (let i = 0; i < plotCols; i += tick) {
        const at = stamps?.[Math.min(i * 2, stamps.length - 1)]
        const label = at === undefined ? '' : hhmm(at)
        if (label === '') continue
        // Centre on the tick, but never let the last one run off the canvas.
        const col = Math.min(GUTTER + i - (label.length >> 1), g.cols - label.length)
        g.text(Math.max(0, col), axisRow + 1, label, AXIS)
      }
    },
    [market],
  )

  const canvasRef = useAsciiCanvas(render, { cellSize: 11, fps: 10, active })

  return (
    <div ref={wrapRef} className="h-full min-h-56 w-full">
      <canvas ref={canvasRef} aria-hidden="true" className="block h-full w-full" />
    </div>
  )
}
