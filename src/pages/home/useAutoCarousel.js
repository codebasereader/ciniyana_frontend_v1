import { useEffect, useState } from 'react'

/**
 * Cycles index 0…length-1 on an interval. Pauses while `paused` is true.
 */
export function useAutoCarousel(length, { intervalMs = 4500, paused = false } = {}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [length])

  useEffect(() => {
    if (length < 2 || paused) return undefined
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % length)
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [length, intervalMs, paused])

  return [index, setIndex]
}
