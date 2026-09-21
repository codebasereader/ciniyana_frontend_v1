import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { store } from './store'
import { Header } from './components/header'
import { Footer } from './components/footer'
import ScrollToTop from './components/ScrollToTop'
import { pageFade } from './components/motion/presets'
import { appRoutes } from './pages'
import AdminRouteTree from './admin/adminRoutes'
import { trackVisitOnce } from './lib/visitTracker'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={pageFade.initial}
        animate={pageFade.animate}
        exit={pageFade.exit}
        transition={pageFade.transition}
      >
        <Routes location={location}>
          {appRoutes.map(({ path, element: Page }) => (
            <Route key={path} path={path} element={<Page />} />
          ))}
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function AppShell() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  useEffect(() => {
    if (!isAdmin) trackVisitOnce()
  }, [isAdmin])

  if (isAdmin) {
    return <AdminRouteTree />
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="overflow-visible">
        <AnimatedRoutes />
      </main>
      <Footer />
      <div className="h-16 sm:hidden" aria-hidden="true" />
    </div>
  )
}

/**
 * index.html ships static title/meta/OG tags as a fallback for crawlers that
 * never run JS. react-helmet-async can't see or replace them (it only tracks
 * tags it rendered itself), so once React mounts and Seo takes over per
 * route, drop the static ones — otherwise both sets sit in <head> at once
 * and anything reading the DOM (including our own scrapers) may pick the
 * stale static tag instead of the page-specific one.
 */
function useDropStaticSeoFallback() {
  useEffect(() => {
    document.querySelectorAll('[data-static-seo]').forEach((el) => el.remove())
  }, [])
}

export default function App() {
  useDropStaticSeoFallback()

  return (
    <HelmetProvider>
      <Provider store={store}>
        <BrowserRouter>
          <ScrollToTop />
          <AppShell />
        </BrowserRouter>
      </Provider>
    </HelmetProvider>
  )
}
