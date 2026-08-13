import { Link } from 'react-router'
import { PixelRule } from '../ui/PixelRule'

interface Pillar {
  title: string
  body: string
}

const pillars: Pillar[] = [
  {
    title: 'Markets',
    body: 'Equity research, trading strategy and macro discussions, run as weekly sessions open to every branch.',
  },
  {
    title: 'Quant',
    body: 'Statistics, backtesting and data driven modelling, from first principles up to competition grade work.',
  },
  {
    title: 'Blockchain',
    body: 'Protocols, smart contracts and the engineering behind decentralised finance, built hands on.',
  },
]

export function About() {
  return (
    <section
      id="about"
      className="relative z-10 w-full px-6 py-20 md:px-10 md:py-28"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <h2 className="font-pixel text-lg leading-tight text-white sm:text-xl md:text-3xl">
          About <span className="text-brand">Us</span>
        </h2>

        <PixelRule className="mt-4 text-base sm:text-lg md:mt-6 md:text-2xl" />

        <p className="mt-6 max-w-2xl font-mono text-xs leading-relaxed text-white/80 sm:text-sm md:text-base">
          Fintech Club is the student body at IIT (ISM) Dhanbad working at the
          point where finance stops being theory and starts being software. We
          read markets, write code, and argue about both.
        </p>

        <p className="mt-4 max-w-2xl font-mono text-xs leading-relaxed text-white/60 sm:text-sm">
          No prior background is assumed. Curiosity is the only prerequisite.
        </p>

        <ul className="mt-12 grid w-full gap-4 text-left md:grid-cols-3">
          {pillars.map((pillar) => (
            <li
              key={pillar.title}
              className="border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-brand/40"
            >
              <h3 className="font-pixel text-base text-brand md:text-lg">
                {pillar.title}
              </h3>
              <p className="mt-3 font-mono text-xs leading-relaxed text-white/70">
                {pillar.body}
              </p>
            </li>
          ))}
        </ul>

        <Link
          to="/members"
          className="mt-12 border border-brand/60 px-5 py-2 font-mono text-xs text-brand transition-colors hover:bg-brand hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand sm:text-sm"
        >
          Meet the members →
        </Link>
      </div>
    </section>
  )
}
