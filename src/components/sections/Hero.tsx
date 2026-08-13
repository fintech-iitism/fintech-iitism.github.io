export function Hero() {
  return (
    <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-20 text-center md:py-32">
      <h1 className="font-pixel text-xl leading-tight text-white sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
        Where <span className="text-brand">finance</span>
        <br />
        meets <span className="text-brand">technology</span>
      </h1>

      <div
        aria-hidden="true"
        className="mt-4 font-pixel text-base tracking-[0.15em] text-white sm:text-lg md:mt-6 md:text-2xl"
      >
        -------------
      </div>

      <p className="mt-4 max-w-md font-mono text-xs text-white/90 sm:text-sm md:mt-6 md:text-base">
        The official finance and technology club of IIT (ISM) Dhanbad
      </p>
    </section>
  )
}
