import { Provider } from 'react-redux'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { store } from './store'
import { Header } from './components/header'
import { Footer } from './components/footer'
import ScrollToTop from './components/ScrollToTop'
import { pageFade } from './components/motion/presets'
import { appRoutes } from './pages'

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

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen bg-white">
          <Header />
          <main className="overflow-visible">
            <AnimatedRoutes />
          </main>
          <Footer />
          {/* Clears fixed mobile bottom nav — must stay AFTER page content */}
          <div className="h-16 sm:hidden" aria-hidden="true" />
        </div>
      </BrowserRouter>
    </Provider>
  )
}
