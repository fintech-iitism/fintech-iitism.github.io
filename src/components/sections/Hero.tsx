import { PixelRule } from '../ui/PixelRule'
import { ScrambleText } from '../ui/ScrambleText'

export function Hero() {
  return (
    <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-20 text-center md:py-32">
      <h1 className="font-pixel text-xl leading-tight text-white sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
        Where <ScrambleText text="finance" className="text-brand" />
        <br />
        meets{' '}
        <ScrambleText text="technology" delay={0.4} className="text-brand" />
      </h1>

      <PixelRule className="mt-4 text-base sm:text-lg md:mt-6 md:text-2xl" />

      <p className="mt-4 max-w-md font-mono text-xs text-white/90 sm:text-sm md:mt-6 md:text-base">
        The official finance and technology club of IIT (ISM) Dhanbad
      </p>
    </section>
  )
}
