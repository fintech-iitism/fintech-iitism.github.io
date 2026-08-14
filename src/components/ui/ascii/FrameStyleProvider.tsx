import { useMemo, useState, type ReactNode } from 'react'
import {
  FrameStyleContext,
  type FrameMotion,
  type FrameStyle,
} from './frameStyle'

/**
 * Holds the frame treatment for the whole page: the three glyph borders dealt
 * across the boxes, moving all the time.
 *
 * It stays in context, and the setters stay live, so the borders can be driven
 * from one place again if a control for them comes back. Nothing calls them
 * today, and nothing is persisted: every reader gets the mixed borders, and a
 * reload only reshuffles which box wears which.
 */
export function FrameStyleProvider({ children }: { children: ReactNode }) {
  const [style, setStyle] = useState<FrameStyle>('mix')
  const [motion, setMotion] = useState<FrameMotion>('always')

  const value = useMemo(
    () => ({ style, motion, setStyle, setMotion }),
    [style, motion],
  )

  return <FrameStyleContext value={value}>{children}</FrameStyleContext>
}
