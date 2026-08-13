// Tiling fractal noise, rendered by the browser rather than shipped as an
// image. 200x200 is large enough that the repeat is not readable.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")"

/** Soft gradient wash with film grain over it, behind every page. */
export function GrainGradient() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-ink">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            // Cool lift at the top, a faint brand-tinted pool bottom right,
            // then the base wash. Layered so the ink never reads flat.
            'radial-gradient(ellipse 90% 55% at 50% -10%, rgba(255,255,255,.07), transparent 70%)',
            'radial-gradient(ellipse 60% 45% at 85% 100%, color-mix(in srgb, var(--color-brand) 9%, transparent), transparent 72%)',
            'linear-gradient(180deg, #1d1d1d 0%, #191919 45%, #141414 100%)',
          ].join(','),
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.16] mix-blend-overlay"
        style={{ backgroundImage: GRAIN, backgroundRepeat: 'repeat' }}
      />
    </div>
  )
}
