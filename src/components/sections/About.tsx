import { Link } from 'react-router'
import { PixelRule } from '../ui/PixelRule'

interface Pillar {
  title: string
  body: string
}

const pillars: Pillar[] = [
  {
    title: 'Finance',
    body: 'Equity research, trading strategy and macro discussions, run as weekly sessions open to every branch.',
  },
  {
    title: 'Quant',
    body: 'Statistics, backtesting and data driven modelling, from first principles up to competition grade work.',
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

        {/* No framed cards here: the two divisions read as plain columns, so
            the only boxes on the site stay the member portraits. */}
        <ul className="mt-14 grid w-full max-w-3xl gap-10 text-center md:grid-cols-2 md:gap-16">
          {pillars.map((pillar) => (
            <li key={pillar.title}>
              <h3 className="font-pixel text-base text-brand md:text-lg">
                {pillar.title}
              </h3>
              <PixelRule length={7} className="mt-2 text-sm text-white/40" />
              <p className="mt-3 font-mono text-xs leading-relaxed text-white/70">
                {pillar.body}
              </p>
            </li>
          ))}
        </ul>

        <Link
          to="/members"
          className="mt-14 font-mono text-xs text-brand underline-offset-8 transition-colors hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand sm:text-sm"
        >
          Meet the members →
        </Link>
      </div>
    </section>
  )
}
