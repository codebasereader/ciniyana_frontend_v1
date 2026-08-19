import { AnimatePresence, motion } from 'motion/react'
import { useLocation } from 'react-router-dom'
import { pageFade } from './presets'

/** Soft opacity fade when the route changes. */
export default function PageTransition({ children }) {
  const { pathname } = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={pageFade.initial}
        animate={pageFade.animate}
        exit={pageFade.exit}
        transition={pageFade.transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
