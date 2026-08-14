import { useEffect, useState } from 'react'

const QUERY = '(hover: none)'

/**
 * True on a device whose pointer cannot hover, which is what a touchscreen
 * reports. Queried rather than measured against a breakpoint: the portrait
 * reveals on the member cards are driven by hover, so what matters is whether
 * the device can hover at all, not how wide its screen happens to be. A small
 * desktop window still hovers; a large tablet still does not.
 */
export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches,
  )

  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const onChange = () => setCoarse(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return coarse
}
