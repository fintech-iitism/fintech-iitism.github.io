import { useState, type ReactNode } from 'react'
import { AsciiBorder } from './ascii/AsciiBorder'
import { nextVariant, useFrameStyle } from './ascii/frameStyle'

interface FrameProps {
  children: ReactNode
  /** Classes on the outer box: sizing and placement, never padding. */
  className?: string
  /** Classes on the content box: padding and inner layout. */
  innerClassName?: string
  /** Frames the dialog wears, brand coloured rather than white. */
  tone?: 'default' | 'brand'
}

/** Room the glyph ring needs, matching AsciiBorder's default cell. */
const RING = 'p-[10px]'

/**
 * The bordered box every card, panel and dialog is built from. Which edge it
 * draws comes from context, so the toggle restyles the whole page at once:
 * either the stair-stepped clip-path, or a ring of ASCII glyphs painted over
 * the box's own edge.
 *
 * The two share a shape, an outer box and an inset content box, so swapping
 * between them never moves the content.
 */
export function Frame({
  children,
  className = '',
  innerClassName = '',
  tone = 'default',
}: FrameProps) {
  const { style, motion } = useFrameStyle()
  const [hot, setHot] = useState(false)
  // Drawn once and kept for the box's lifetime, so a hover or a resize never
  // reshuffles the border out from under the reader. A reload deals again.
  const [dealt] = useState(nextVariant)

  const content = (
    <div className={`min-h-0 flex-1 ${innerClassName}`}>{children}</div>
  )

  if (style === 'pixel') {
    const fill = tone === 'brand' ? 'bg-brand/70' : 'bg-white/15 hover:bg-brand/70'
    return (
      <div className={`pixel-frame ${fill} p-[4px] transition-colors ${className}`}>
        <div className="pixel-frame flex h-full min-h-0 flex-col bg-ink">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div
      onPointerEnter={() => setHot(true)}
      onPointerLeave={() => setHot(false)}
      className={`relative bg-ink ${className}`}
    >
      <AsciiBorder
        variant={style === 'mix' ? dealt : style}
        active={motion === 'always' || hot}
        hot={hot || tone === 'brand'}
      />

      <div className={`relative flex h-full min-h-0 flex-col ${RING}`}>
        {content}
      </div>
    </div>
  )
}
