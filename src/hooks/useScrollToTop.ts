import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router'

/**
 * Starts a new page at the top. A client side route change only swaps what is
 * rendered, so without this the reader lands on the next page at whatever
 * offset they had scrolled the last one to.
 *
 * Two cases are left alone: going back or forward, where the browser restores
 * the position that entry was left at and jumping to the top would throw that
 * away, and any URL carrying a hash, which names its own target.
 */
export function useScrollToTop(): void {
  const { pathname, hash } = useLocation()
  const navigation = useNavigationType()

  useEffect(() => {
    if (navigation === 'POP' || hash) return
    window.scrollTo(0, 0)
  }, [pathname, hash, navigation])
}
