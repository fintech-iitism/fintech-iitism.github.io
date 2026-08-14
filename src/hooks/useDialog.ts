import { useEffect, useRef } from 'react'

/**
 * Chrome shared by every dialog on the site: Escape closes it, the page behind
 * it is frozen, and focus lands on the panel. Returns the ref to put on the
 * panel element.
 */
export function useDialog(onClose: () => void) {
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)

    // Freezing the body can hand the page back the scrollbar's width and shift
    // everything sideways, so any width actually gained is padded back on for as
    // long as the dialog is up. Measured across the change rather than from the
    // scrollbar's width: `scrollbar-gutter: stable` reserves the gutter whether
    // the page scrolls or not, so nothing is gained there and padding it would
    // be the thing that caused the shift. Overlay scrollbars gain nothing
    // either, and both are left alone.
    const { overflow, paddingRight } = document.body.style
    const before = document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    const gained = document.documentElement.clientWidth - before
    if (gained > 0) document.body.style.paddingRight = `${gained}px`
    panel.current?.focus()

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
    }
  }, [onClose])

  return panel
}
