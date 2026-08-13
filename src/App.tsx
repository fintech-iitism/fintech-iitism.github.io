import { BrowserRouter, Route, Routes } from 'react-router'
import { RootLayout } from './components/layout/RootLayout'
import { Home } from './pages/Home'
import { PagePlaceholder } from './pages/PagePlaceholder'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<PagePlaceholder title="About Us" />} />
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
