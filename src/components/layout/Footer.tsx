import { Link } from 'react-router'
import { GlyphRule } from '../ui/ascii/GlyphRule'

interface FooterLink {
  label: string
  to: string
}

interface ExternalLink {
  label: string
  href: string
}

const siteLinks: FooterLink[] = [
  { label: 'About Us', to: '/about' },
  { label: 'Members', to: '/members' },
  { label: 'Blog', to: '/blog' },
  { label: 'Resources', to: '/resources' },
  { label: 'Events', to: '/events' },
]

// Placeholder destinations until the club's real handles are wired in.
const socialLinks: ExternalLink[] = [
  { label: 'Instagram', href: '#' },
  { label: 'LinkedIn', href: '#' },
  { label: 'GitHub', href: '#' },
  { label: 'Email', href: 'mailto:fintech@iitism.ac.in' },
]

export function Footer() {
  return (
    <footer className="relative z-10 w-full">
      {/* Full bleed, outside the padding, so the rule reads as the page's edge
          the way the hairline border it replaces did. */}
      <GlyphRule fill className="text-sm text-white/20" />

      <div className="flex flex-col gap-10 px-6 py-12 md:flex-row md:justify-between md:px-10">
        <div className="max-w-xs">
          <img
            src="/logo-mark.png"
            alt="Fintech Club, IIT (ISM) Dhanbad"
            className="h-9 w-auto brightness-200"
          />
          <p className="mt-4 font-mono text-xs leading-relaxed text-white/60">
            The official finance and technology club of IIT (ISM) Dhanbad.
          </p>
        </div>

        <nav className="flex gap-12 md:gap-20">
          <div>
            <h2 className="font-pixel text-sm text-white">Site</h2>
            <ul className="mt-4 flex flex-col gap-2 font-mono text-xs text-white/60">
              {siteLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-pixel text-sm text-white">Elsewhere</h2>
            <ul className="mt-4 flex flex-col gap-2 font-mono text-xs text-white/60">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    className="transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      <div className="px-6 pb-12 md:px-10">
        <GlyphRule fill className="text-sm text-white/15" />

        <div className="mt-6 flex flex-col gap-2 font-mono text-xs text-white/40 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Fintech Club, IIT (ISM) Dhanbad.</p>
        </div>
      </div>
    </footer>
  )
}
