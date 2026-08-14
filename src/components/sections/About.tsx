import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { DivisionPanel, type DivisionDetail } from '../ui/DivisionPanel'
import { MonteCarlo } from '../ui/ascii/MonteCarlo'
import { TickerChart } from '../ui/ascii/TickerChart'
import { PixelRule } from '../ui/PixelRule'

interface Division {
  title: string
  body: string
  from: 'left' | 'right'
  details: DivisionDetail[]
  visual: ReactNode
}

const divisions: Division[] = [
  {
    title: 'Finance',
    body: 'Equity research, trading strategy and macro discussions, run as weekly sessions open to every branch.',
    from: 'left',
    details: [
      {
        label: 'Equity Research',
        body: 'Company teardowns end to end: filings, valuation models and a written thesis defended in front of the club.',
      },
      {
        label: 'Markets Desk',
        body: 'A weekly read on rates, currencies and the headlines that moved them, so the numbers stay attached to the world.',
      },
      {
        label: 'Trading Strategy',
        body: 'Paper portfolios with real rules: sizing, risk limits and a post mortem on every position that went wrong.',
      },
      {
        label: 'Start Here',
        body: 'Sessions assume nothing. Bring a laptop and an opinion; the reading list gets you the rest.',
      },
    ],
    visual: <TickerChart />,
  },
  {
    title: 'Quant',
    body: 'Statistics, backtesting and data driven modelling, from first principles up to competition grade work.',
    from: 'right',
    details: [
      {
        label: 'Foundations',
        body: 'Probability, time series and stochastic processes, taught the way they actually show up in a pricing model.',
      },
      {
        label: 'Backtesting',
        body: 'Building engines in Python, then breaking them: lookahead bias, survivorship and the costs everyone forgets.',
      },
      {
        label: 'Modelling',
        body: 'Signal research and machine learning on market data, judged on out of sample results rather than fit.',
      },
      {
        label: 'Competitions',
        body: 'Teams for trading and datathon contests, with internal problem sets running through the term.',
      },
    ],
    visual: <MonteCarlo />,
  },
]

export function About() {
  // Every block below owns a screen of its own, on the same rhythm as the
  // hero, so scrolling moves between whole beats rather than through a
  // continuous column of stacked content.
  return (
    <section id="about" className="relative z-10 w-full">
      <div className="mx-auto flex min-h-svh max-w-5xl flex-col items-center justify-center px-6 py-24 text-center md:px-10">
        <h2 className="font-pixel text-2xl leading-tight text-white">
          About <span className="text-brand">Us</span>
        </h2>

        <PixelRule className="mt-4 text-lg md:mt-6" />

        <p className="mt-6 max-w-2xl font-mono text-sm leading-relaxed text-white/80">
          Fintech Club is the student body at IIT (ISM) Dhanbad working at the
          point where finance stops being theory and starts being software. We
          read markets, write code, and argue about both.
        </p>

        <p className="mt-4 max-w-2xl font-mono text-xs leading-relaxed text-white/60">
          No prior background is assumed. Curiosity is the only prerequisite.
        </p>

        {/* A link, styled like the ones in the nav and the footer: mono, in
            sentence case, brand until hovered. No box and no fill, so it does
            not compete with the framed panels below it. */}
        <Link
          to="/members"
          className="group mt-10 font-mono text-sm text-brand transition-colors hover:text-white md:mt-12 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          Meet the members{' '}
          <span className="inline-block transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>

      <ul className="flex w-full flex-col">
        {divisions.map((division, i) => (
          <li
            key={division.title}
            className="mx-auto flex min-h-svh w-full max-w-5xl items-center px-6 py-24 md:px-10"
          >
            <DivisionPanel index={i + 1} {...division} />
          </li>
        ))}
      </ul>
    </section>
  )
}
