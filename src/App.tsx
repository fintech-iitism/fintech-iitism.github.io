import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { RootLayout } from './components/layout/RootLayout'
import { About } from './pages/About'
import { Home } from './pages/Home'
import { PagePlaceholder } from './pages/PagePlaceholder'

// Split out so the roster and its cards only download on the members page.
const Members = lazy(() =>
  import('./pages/Members').then((m) => ({ default: m.Members })),
)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route
            path="members"
            element={
              <Suspense fallback={null}>
                <Members />
              </Suspense>
            }
          />
          <Route path="blog" element={<PagePlaceholder title="Blog" />} />
          <Route
            path="resources"
            element={<PagePlaceholder title="Resources" />}
          />
          <Route path="events" element={<PagePlaceholder title="Events" />} />
          <Route path="*" element={<PagePlaceholder title="404" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
