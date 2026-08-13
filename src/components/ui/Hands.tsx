import { AsciiHoverImage } from './AsciiHoverImage'

/**
 * Decorative hands, split out of the original artwork with the black plate
 * removed, so each side anchors to its own screen edge instead of relying on a
 * single background image that has to be cropped or letterboxed to fit.
 */
export function Hands() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 hidden overflow-hidden md:block"
    >
      {/* Each hand resolves outward from the middle of the screen. */}
      <AsciiHoverImage
        src="/hand-left.png"
        introFrom="right"
        className="absolute top-[58%] left-0 w-[clamp(180px,26vw,480px)] -translate-y-1/2"
      />
      <AsciiHoverImage
        src="/hand-right.png"
        introFrom="left"
        className="absolute top-[42%] right-0 w-[clamp(170px,25vw,460px)] -translate-y-1/2"
      />
    </div>
  )
}
