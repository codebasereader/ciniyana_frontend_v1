import { useEffect, useState } from 'react'

/** Module cache so logos don't re-flash black on remount / language switch */
const processedCache = new Map()

function processKnockout(src, threshold) {
  const key = `${src}::${threshold}`
  if (processedCache.has(key)) {
    return Promise.resolve(processedCache.get(key))
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) {
          resolve(src)
          return
        }

        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const { data } = imageData

        for (let i = 0; i < data.length; i += 4) {
          if (
            data[i] <= threshold &&
            data[i + 1] <= threshold &&
            data[i + 2] <= threshold
          ) {
            data[i + 3] = 0
          }
        }

        ctx.putImageData(imageData, 0, 0)
        const out = canvas.toDataURL('image/png')
        processedCache.set(key, out)
        resolve(out)
      } catch (err) {
        reject(err)
      }
    }
    img.onerror = reject
    img.src = src
  })
}

/**
 * Logo with black backdrop knocked out.
 * Stays invisible until processing finishes so black never flashes.
 */
export default function KnockoutLogo({
  src,
  alt,
  className = '',
  threshold = 28,
}) {
  const cached = processedCache.get(`${src}::${threshold}`)
  const [resolvedSrc, setResolvedSrc] = useState(cached || null)
  const [ready, setReady] = useState(Boolean(cached))

  useEffect(() => {
    let cancelled = false
    const key = `${src}::${threshold}`
    const hit = processedCache.get(key)

    if (hit) {
      setResolvedSrc(hit)
      setReady(true)
      return undefined
    }

    // Hide until ready — avoid showing raw black PNG
    setReady(false)
    setResolvedSrc(null)

    processKnockout(src, threshold)
      .then((out) => {
        if (!cancelled) {
          setResolvedSrc(out)
          setReady(true)
        }
      })
      .catch(() => {
        if (!cancelled) {
          // Fallback only after fail — still better than black flash on success path
          setResolvedSrc(src)
          setReady(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [src, threshold])

  return (
    <span
      className={`inline-flex max-w-full items-center justify-center overflow-hidden ${className}`}
      style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.2s ease' }}
      aria-hidden={!ready}
    >
      {resolvedSrc ? (
        <img
          src={resolvedSrc}
          alt={ready ? alt : ''}
          className="h-full max-h-full w-full max-w-full select-none object-contain"
          draggable={false}
        />
      ) : null}
    </span>
  )
}
