import { batches } from '../../data/members'
import { MemberCard } from '../ui/MemberCard'
import { PixelRule } from '../ui/PixelRule'

export function Members() {
  return (
    <section className="relative z-10 w-full px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto flex max-w-5xl flex-col items-center">
        <h1 className="font-pixel text-3xl leading-tight text-white md:text-5xl">
          The <span className="text-brand">Members</span>
        </h1>

        <PixelRule className="mt-4 text-base md:mt-6 md:text-2xl" />

        <p className="mt-6 max-w-2xl text-center font-mono text-sm leading-relaxed text-white/70 md:text-base">
          The people running the club this year.
        </p>

        {/* One block per graduating year. A second heading appears on its own
            once a batch with another year is added to the roster. */}
        {batches.map((batch) => (
          <div key={batch.year} className="mt-16 w-full md:mt-20">
            <h2 className="font-pixel text-xl text-white md:text-3xl">
              Batch of <span className="text-brand">{batch.year}</span>
            </h2>

            <ul className="mt-8 grid w-full grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {batch.members.map((member) => (
                <li key={member.admission}>
                  <MemberCard {...member} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
