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
    <header className="sticky top-0 z-30 w-full px-6 py-4 md:px-10">
      {/* Blur lives on its own layer, twice the header's height: opaque for the
          full header so the logo and links sit on frosted glass, then fading
          across the band below it so there is no visible bottom edge. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[200%] bg-ink/15 backdrop-blur-xl [mask-image:linear-gradient(to_bottom,#000_0,#000_50%,transparent_100%)]"
      />

      <nav className="flex flex-col items-center gap-6 md:flex-row md:justify-between md:gap-10">
        <NavLink to="/" className="shrink-0">
          <img
            src="/logo-mark.png"
            alt="Fintech Club, IIT (ISM) Dhanbad"
            className="h-9 w-auto brightness-200 md:h-11"
          />
        </NavLink>

        <ul className="flex flex-wrap items-center justify-center gap-5 font-mono text-xs text-white sm:text-sm md:gap-10 md:text-base lg:gap-16">
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
