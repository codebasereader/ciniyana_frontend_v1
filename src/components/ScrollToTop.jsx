import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Instant scroll-to-top on route change (avoids fighting page fade). */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
