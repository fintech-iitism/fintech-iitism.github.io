import type { AsciiGrid } from './useAsciiCanvas'

// Braille cells carry a 2x4 grid of dots, so a plot drawn through this layer
// resolves at twice the character columns and four times the rows. One bit per
// dot, indexed [x][y] within a cell, offset from U+2800.
const BRAILLE = 0x2800
const DOT = [
  [0x01, 0x02, 0x04, 0x40],
  [0x08, 0x10, 0x20, 0x80],
] as const

export interface BrailleLayer {
  /** Plot width in dots. */
  readonly dotCols: number
  /** Plot height in dots. */
  readonly dotRows: number
  /** Lights one dot. Out of range coordinates are dropped. */
  plot: (x: number, y: number, color: string) => void
  /** Emits the accumulated dots as glyphs, with the plot's top left at a cell. */
  flush: (g: AsciiGrid, col: number, row: number) => void
}

/**
 * Dot canvas over a block of character cells. Callers plot in dot coordinates
 * and flush once; the layer folds the dots of each cell into a single glyph.
 * Where two series share a cell the later one owns its colour, so draw the
 * subject last.
 */
export function createBrailleLayer(cols: number, rows: number): BrailleLayer {
  const mask = new Uint8Array(cols * rows)
  const ink = new Array<string>(cols * rows)

  return {
    dotCols: cols * 2,
    dotRows: rows * 4,
    plot: (x, y, color) => {
      if (x < 0 || y < 0 || x >= cols * 2 || y >= rows * 4) return
      const cell = (y >> 2) * cols + (x >> 1)
      mask[cell] = mask[cell]! | DOT[x & 1]![y & 3]!
      ink[cell] = color
    },
    flush: (g, col, row) => {
      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          const cell = cy * cols + cx
          const bits = mask[cell]!
          if (bits !== 0) g.put(col + cx, row + cy, String.fromCharCode(BRAILLE + bits), ink[cell])
        }
      }
    },
  }
}
