import { Outlet } from 'react-router'
import { useScrollToTop } from '../../hooks/useScrollToTop'
import { FrameStyleProvider } from '../ui/ascii/FrameStyleProvider'
import { PixelBackdrop } from '../ui/PixelBackdrop'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

export function RootLayout() {
  useScrollToTop()

  return (
    // No background here: the fixed backdrop behind it paints the page.
    <FrameStyleProvider>
      <div className="relative flex min-h-screen flex-col">
        <PixelBackdrop />
        <Navbar />
        <main className="flex flex-1 flex-col">
          <Outlet />
        </main>
        <Footer />
      </div>
    </FrameStyleProvider>
  )
}
