/**
 * The alphabet and timings the glyph edges share, so a rule and a border drawn
 * with the same variant read as the same material.
 */

/** Glyphs a resting rule drifts into. */
export const DRIFT = '=~:*'

/** The denser set the noise band and the pulse head are built from. */
export const DENSE = '#%@*=+'

/** Share of a resting rule's cells that drift to another glyph each frame. */
export const DRIFT_RATE = 0.08

/** The packet a pulsing rule carries: heavier and odder than the run it rides. */
export const SPARK = '=+©#½*@'

/** Loops per second the pulse takes along its run. */
export const PULSE_SPEED = 0.35

/**
 * Glyphs per second the packet travels along a rule. Measured in glyphs rather
 * than laps: a rule spanning the footer holds several times the characters of
 * one in a menu, and a lap-based speed would fire the wide one across at a
 * pace the narrow one never reaches.
 */
export const PULSE_CPS = 16

/** Cells lit by the pulse head. */
export const PULSE_PACKET = 7

/** Deterministic 0..1 from a number, so a cell is stable within a frame. */
export const rand = (seed: number): number => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

/** Picks out of a glyph set with an already-rolled 0..1. */
export const from = (set: string, roll: number): string =>
  set[(roll * set.length) | 0]!
