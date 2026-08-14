import { PixelRule } from '../ui/PixelRule'
import { ScrambleText } from '../ui/ScrambleText'

export function Hero() {
  return (
    <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-20 text-center md:py-32">
      <h1 className="font-pixel text-3xl leading-tight text-white">
        Where <ScrambleText text="Finance" className="text-brand" />
        <br />
        meets{' '}
        <ScrambleText text="Technology" delay={0.4} className="text-brand" />
      </h1>

      <PixelRule className="mt-4 text-lg md:mt-6" />

      <p className="mt-4 max-w-md font-mono text-sm text-white/90 md:mt-6">
        The official finance and technology club of IIT (ISM) Dhanbad
      </p>
    </section>
  )
}
