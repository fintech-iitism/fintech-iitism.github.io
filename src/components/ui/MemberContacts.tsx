import type { ReactNode } from 'react'
import type { Member } from '../../data/members'
import { GithubIcon, LinkedinIcon, MailIcon } from './BrandIcons'

interface Contact {
  label: string
  href: string
  icon: ReactNode
}

interface MemberContactsProps
  extends Pick<Member, 'name' | 'email' | 'github' | 'linkedin'> {
  className?: string
  /** Icon box in Tailwind sizing units, so the dialog can run them larger. */
  size?: string
}

/**
 * A member's outbound links as an icon row. Shared by the card and the dialog,
 * which show the same three and must agree on their order.
 */
export function MemberContacts({
  name,
  email,
  github,
  linkedin,
  className = '',
  size = 'h-4 w-4',
}: MemberContactsProps) {
  const contacts: Contact[] = []
  if (github) {
    contacts.push({
      label: `${name} on GitHub`,
      href: github,
      icon: <GithubIcon className="h-full w-full" />,
    })
  }
  if (linkedin) {
    contacts.push({
      label: `${name} on LinkedIn`,
      href: linkedin,
      icon: <LinkedinIcon className="h-full w-full" />,
    })
  }
  if (email) {
    contacts.push({
      label: `Email ${name}`,
      href: `mailto:${email}`,
      icon: <MailIcon className="h-full w-full" />,
    })
  }

  if (contacts.length === 0) return null

  return (
    <ul className={`flex items-center gap-2.5 text-white/50 ${className}`}>
      {contacts.map((contact) => (
        <li key={contact.href} className={size}>
          <a
            href={contact.href}
            target={contact.href.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            aria-label={contact.label}
            title={contact.label}
            className="block h-full w-full transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {contact.icon}
          </a>
        </li>
      ))}
    </ul>
  )
}
