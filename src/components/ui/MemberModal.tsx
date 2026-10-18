import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'motion/react'
import type { Member } from '../../data/members'
import { useDialog } from '../../hooks/useDialog'
import { Frame } from './Frame'
import { MemberContacts } from './MemberContacts'
import { PixelRule } from './PixelRule'

const PLACEHOLDER = '/member-placeholder.png'

interface MemberModalProps {
  member: Member
  onClose: () => void
}

/**
 * The opened member card, as a dialog over the whole page. The portrait is a
 * plain image here rather than the card's ASCII canvas: this exists because a
 * touchscreen cannot hover, so it can never trigger the reveal, and the photo
 * would otherwise never be seen at all.
 *
 * Through a portal for the same reason the division dialog is: the card sits
 * inside a transformed motion element, and a transformed ancestor would make
 * `position: fixed` resolve against the card instead of the viewport.
 */
export function MemberModal({ member, onClose }: MemberModalProps) {
  const still = useReducedMotion()
  const panel = useDialog(onClose)
  const { name, branch, role, image } = member

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        aria-hidden="true"
        onClick={onClose}
        initial={still ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: still ? 0 : 0.2 }}
        className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
      />

      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={name}
        tabIndex={-1}
        initial={still ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={still ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
        transition={{ duration: still ? 0 : 0.28, ease: 'easeOut' }}
        className="relative flex max-h-[90svh] w-full max-w-sm flex-col focus:outline-none"
      >
        <Frame
          tone="brand"
          className="flex min-h-0 flex-1 flex-col"
          innerClassName="overflow-y-auto p-5"
        >
          {/* Natural aspect, not cropped to the card's 4:5: the point of opening
              this is to see the whole photograph. */}
          <img
            src={image ?? PLACEHOLDER}
            alt={name}
            className="block w-full"
          />

          <p
            className="mt-5 font-mono text-2xs tracking-[0.2em] text-brand"
            aria-hidden={role ? undefined : true}
          >
            {role?.toUpperCase() ?? '\u00A0'}
          </p>

          <h3 className="mt-1.5 font-pixel text-xl leading-tight text-white">
            {name}
          </h3>

          <PixelRule length={7} className="mt-3 text-sm text-brand" />

          <p className="mt-3 font-mono text-sm text-white/60">{branch}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <MemberContacts {...member} size="h-5 w-5" />
          </div>
        </Frame>

        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${name}`}
          className="absolute right-4 top-4 z-10 font-pixel text-lg text-white/60 transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          X
        </button>
      </motion.div>
    </div>,
    document.body,
  )
}
