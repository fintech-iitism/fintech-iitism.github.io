import { members } from '../../data/members'
import { MemberCard } from '../ui/MemberCard'
import { PixelRule } from '../ui/PixelRule'

export function Members() {
  return (
    <section className="relative z-10 w-full px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto flex max-w-5xl flex-col items-center">
        <h1 className="font-pixel text-lg leading-tight text-white sm:text-xl md:text-3xl">
          The <span className="text-brand">Members</span>
        </h1>

        <PixelRule className="mt-4 text-base sm:text-lg md:mt-6 md:text-2xl" />

        <p className="mt-6 max-w-2xl text-center font-mono text-xs leading-relaxed text-white/70 sm:text-sm">
          The people running the club this year.
        </p>

        <ul className="mt-12 grid w-full grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {members.map((member) => (
            <li key={member.name}>
              <MemberCard {...member} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
