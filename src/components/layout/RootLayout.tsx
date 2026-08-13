import { Outlet } from 'react-router'
import { Navbar } from './Navbar'

export function RootLayout() {
  return (
    <div className="relative flex min-h-screen flex-col bg-ink">
      <Navbar />
      <Outlet />
    </div>
  )
}
