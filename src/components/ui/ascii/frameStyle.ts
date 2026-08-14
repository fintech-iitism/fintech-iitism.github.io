import { createContext, useContext } from 'react'

/** The glyph borders. Every one of these can be drawn by `AsciiBorder`. */
export const ASCII_VARIANTS = ['terminal', 'noise', 'pulse'] as const

export type AsciiVariant = (typeof ASCII_VARIANTS)[number]

/**
 * Edge treatments a framed box can wear. `pixel` is the original clip-path and
 * `mix` deals the three glyph borders out across the page's boxes.
 */
export const FRAME_STYLES = ['mix', 'pixel', ...ASCII_VARIANTS] as const

export type FrameStyle = (typeof FRAME_STYLES)[number]

export const FRAME_LABELS: Record<FrameStyle, string> = {
  mix: 'Mixed',
  pixel: 'Pixel',
  terminal: 'Terminal',
  noise: 'Noise',
  pulse: 'Pulse',
}

// Boxes draw from a bag rather than rolling a die each time: three picks in a
// row landing on the same border is a plausible dice roll and a bad shuffle,
// and the members grid puts twenty of these next to each other. Refilling with
// a fresh shuffle keeps the three even across the page but unpredictable.
let bag: AsciiVariant[] = []

/** The next border in the shuffle. Called once per box, when it mounts. */
export const nextVariant = (): AsciiVariant => {
  if (bag.length === 0) {
    bag = [...ASCII_VARIANTS]
    for (let i = bag.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0
      ;[bag[i], bag[j]] = [bag[j]!, bag[i]!]
    }
  }
  return bag.pop()!
}

/** Whether the glyphs move all the time or only under the pointer. */
export const FRAME_MOTIONS = ['always', 'hover'] as const

export type FrameMotion = (typeof FRAME_MOTIONS)[number]

export const MOTION_LABELS: Record<FrameMotion, string> = {
  always: 'Always',
  hover: 'On hover',
}

export interface FrameSettings {
  style: FrameStyle
  motion: FrameMotion
  setStyle: (style: FrameStyle) => void
  setMotion: (motion: FrameMotion) => void
}

export const FrameStyleContext = createContext<FrameSettings>({
  style: 'mix',
  motion: 'always',
  setStyle: () => {},
  setMotion: () => {},
})

export const useFrameStyle = (): FrameSettings => useContext(FrameStyleContext)
