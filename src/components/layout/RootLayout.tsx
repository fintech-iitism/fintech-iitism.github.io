import { Outlet } from 'react-router'
import { GrainGradient } from '../ui/GrainGradient'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

export function RootLayout() {
  return (
    // No background here: the fixed grain plate behind it paints the page.
    <div className="relative flex min-h-screen flex-col">
      <GrainGradient />
      <Navbar />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
