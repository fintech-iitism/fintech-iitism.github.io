import { useEffect, useRef, useState } from 'react'

interface ScrambleTextProps {
  text: string
  /** Seconds until every character has settled. */
  duration?: number
  /** Seconds to wait before the first run. Replays start immediately. */
  delay?: number
  /** Milliseconds between character swaps while a slot is still churning. */
  churnMs?: number
  className?: string
}

const CHARSET = 'abcdefghijklmnopqrstuvwxyz0123456789<>/\\{}[]=+*#$%&@'

const pick = (): string => CHARSET[(Math.random() * CHARSET.length) | 0]!

/**
 * Resolves `text` out of random characters, left to right, on mount and again
 * on hover. The word is laid out by an invisible copy of the settled text, so
 * the churning glyphs cannot change the line's width and shove its neighbours
 * around.
 */
export function ScrambleText({
  text,
  duration = 1.6,
  delay = 0,
  churnMs = 45,
  className = '',
}: ScrambleTextProps) {
  // Starts scrambled so the real text never flashes on the first paint.
  const [shown, setShown] = useState(() => Array.from(text, pick).join(''))
  const [run, setRun] = useState(0)
  const frameRef = useRef(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(text)
      return
    }

    // Anchored on the first animation frame rather than performance.now(), so
    // the delay is measured on the same clock the ticks arrive on.
    let start = 0
    // Each character owns a slice of the run, so the word locks in left to
    // right while the tail keeps churning.
    const step = duration / (text.length + 1)
    // Unsettled characters only swap on this interval, so the churn reads as
    // a shuffle rather than per-frame noise.
    const churn = Array.from(text, pick)
    let lastSwap = 0

    const tick = (now: number) => {
      if (start === 0) start = now + (run === 0 ? delay * 1000 : 0)
      const elapsed = (now - start) / 1000
      if (now - lastSwap >= churnMs) {
        lastSwap = now
        for (let i = 0; i < churn.length; i++) churn[i] = pick()
      }

      let out = ''
      let done = true

      for (let i = 0; i < text.length; i++) {
        const char = text[i]!
        if (char === ' ' || elapsed > (i + 1) * step) {
          out += char
        } else {
          // Churns through the delay too, so a staggered word is never blank
          // while its neighbours are already on screen.
          out += churn[i]!
          done = false
        }
      }

      setShown(out)
      if (!done) frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [text, duration, delay, churnMs, run])

  return (
    <span
      className={`relative inline-block whitespace-nowrap ${className}`}
      aria-label={text}
      onMouseEnter={() => setRun((r) => r + 1)}
    >
      <span className="invisible" aria-hidden="true">
        {text}
      </span>
      <span className="absolute inset-0 text-center" aria-hidden="true">
        {shown}
      </span>
    </span>
  )
}
