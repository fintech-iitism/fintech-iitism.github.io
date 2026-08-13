import { NavLink } from 'react-router'

interface NavItem {
  label: string
  to: string
}

const items: NavItem[] = [
  { label: 'About Us', to: '/about' },
  { label: 'Blog', to: '/blog' },
  { label: 'Resources', to: '/resources' },
  { label: 'Events', to: '/events' },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 w-full px-6 py-5 md:px-10">
      {/* Blur lives on its own layer so the mask can fade the frosted edge out
          instead of ending on a visible seam. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-ink/15 backdrop-blur-xl [mask-image:linear-gradient(to_bottom,#000_45%,transparent_100%)]"
      />

      <nav className="flex flex-col items-center gap-6 md:flex-row md:justify-between md:gap-10">
        <NavLink to="/" className="shrink-0">
          <img
            src="/logo-mark.png"
            alt="Fintech Club, IIT (ISM) Dhanbad"
            className="h-12 w-auto brightness-200 md:h-16"
          />
        </NavLink>

        <ul className="flex flex-wrap items-center justify-center gap-6 font-mono text-base text-white md:gap-16 md:text-xl lg:gap-24">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand ${
                    isActive ? 'text-brand' : ''
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
