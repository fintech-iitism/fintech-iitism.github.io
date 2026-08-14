import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { GlyphRule } from '../ui/ascii/GlyphRule'

interface NavItem {
  label: string
  to: string
  /** Id of a section on the home page, scrolled to instead of routed to. */
  sectionId?: string
}

const items: NavItem[] = [
  { label: 'Members', to: '/members' },
  { label: 'Blog', to: '/blog' },
  { label: 'Resources', to: '/resources' },
  { label: 'Events', to: '/events' },
]

const linkClass = ({ isActive }: { isActive: boolean }): string =>
  `transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand ${
    isActive ? 'text-brand' : ''
  }`

interface NavItemLinkProps {
  item: NavItem
  tabIndex?: number
  onNavigate?: () => void
}

function NavItemLink({ item, tabIndex, onNavigate }: NavItemLinkProps) {
  const { pathname } = useLocation()

  const { sectionId } = item

  if (sectionId) {
    const onHome = pathname === '/'
    return (
      <a
        href={item.to}
        tabIndex={tabIndex}
        className={linkClass({ isActive: false })}
        onClick={(e) => {
          // On the home page this is a scroll, not a navigation. Elsewhere the
          // plain href takes the user home and the browser handles the anchor.
          if (!onHome) return
          e.preventDefault()
          document
            .getElementById(sectionId)
            ?.scrollIntoView({ behavior: 'smooth' })
          window.history.replaceState(null, '', `#${sectionId}`)
          onNavigate?.()
        }}
      >
        {item.label}
      </a>
    )
  }

  return (
    <NavLink to={item.to} tabIndex={tabIndex} className={linkClass}>
      {item.label}
    </NavLink>
  )
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  // Route changes and Escape both close the sheet.
  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="sticky top-0 z-30 w-full px-5 py-5 sm:px-6 md:px-10 md:py-6">
      {/* Dithered plate the exact size of the header, near enough opaque that
          nothing scrolling under the bar reads through it, while the dither
          keeps it from looking like a flat lid. Replaces the frosted blur this
          used to lean on. */}
      <div
        aria-hidden="true"
        className="dither-plate pointer-events-none absolute inset-0 -z-10 bg-ink/90"
      />

      {/* Two rules rather than a ring: the bar runs the full width of the
          page, so the vertical sides of a box would be pinned to the window
          edges with nothing to enclose. Both are plain dashes: the bar is on
          screen at all times, and anything moving in it competes with the page
          it sits over. */}
      <GlyphRule
        fill
        className="absolute inset-x-0 top-0 text-sm leading-none text-white/30"
      />
      <GlyphRule
        fill
        className="absolute inset-x-0 bottom-0 text-sm leading-none text-white/30"
      />

      <nav className="flex items-center justify-between gap-4 md:gap-10">
        <NavLink to="/" className="shrink-0">
          <img
            src="/logo-mark.png"
            alt="Fintech Club, IIT (ISM) Dhanbad"
            className="h-7 w-auto brightness-200 md:h-9"
          />
        </NavLink>

        <ul className="hidden items-center font-mono text-white text-sm md:flex md:gap-8 lg:gap-12">
          {items.map((item) => (
            <li key={item.to}>
              <NavItemLink item={item} />
            </li>
          ))}
        </ul>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen(!open)}
          className="flex h-8 w-8 flex-col items-center justify-center gap-[3px] text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:hidden"
        >
          {/* Square bars, no rounding, to sit with the pixel type. */}
          <span
            className={`block h-[2px] w-4 bg-current transition-transform ${
              open ? 'translate-y-[5px] rotate-45' : ''
            }`}
          />
          <span
            className={`block h-[2px] w-4 bg-current transition-opacity ${
              open ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block h-[2px] w-4 bg-current transition-transform ${
              open ? '-translate-y-[5px] -rotate-45' : ''
            }`}
          />
        </button>
      </nav>

      <ul
        id="mobile-nav"
        className={`grid overflow-hidden font-mono text-xs text-white transition-[grid-template-rows,opacity] duration-300 md:hidden ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <li className="min-h-0">
          <GlyphRule fill className="mt-4 text-sm text-white/25" />
          <ul className="mt-4 flex flex-col gap-4">
            {items.map((item) => (
              <li key={item.to}>
                <NavItemLink
                  item={item}
                  tabIndex={open ? 0 : -1}
                  onNavigate={() => setOpen(false)}
                />
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </header>
  )
}
