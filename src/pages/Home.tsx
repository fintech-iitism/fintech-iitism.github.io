import { About } from '../components/sections/About'
import { Hero } from '../components/sections/Hero'
import { Hands } from '../components/ui/Hands'

export function Home() {
  return (
    <>
      {/* Hands are scoped to the first screen so they do not drift down into
          the sections below as the page grows. */}
      <div className="relative flex min-h-[calc(100vh-6.5rem)] flex-col">
        <Hands />
        <Hero />
      </div>
      <About />
    </>
  )
}
