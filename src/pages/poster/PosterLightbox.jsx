import { useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa'
import { AnimatePresence, motion } from 'motion/react'
import { selectLanguage } from '../../store/slices/languageSlice'

/**
 * Lightbox: large active poster + thumbnail carousel below (active highlighted).
 */
export default function PosterLightbox({
  posters,
  index,
  onClose,
  onChange,
  accent = '#9a6b2f',
}) {
  const language = useSelector(selectLanguage)
  const total = posters.length
  const active = posters[index]
  const title = language === 'en' ? active?.title?.en : active?.title?.kn

  const go = useCallback(
    (dir) => {
      if (!total) return
      onChange((index + dir + total) % total)
    },
    [index, onChange, total],
  )

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [go, onClose])

  if (!active) return null

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-black/85 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Poster'}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 sm:right-5 sm:top-5"
      >
        <FaTimes />
      </button>

      {/* Main stage */}
      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-4 pt-14 pb-3 sm:px-8">
        {total > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous"
              className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30 sm:left-4 sm:h-11 sm:w-11"
            >
              <FaChevronLeft />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next"
              className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30 sm:right-4 sm:h-11 sm:w-11"
            >
              <FaChevronRight />
            </button>
          </>
        ) : null}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex max-h-full w-full max-w-4xl flex-col items-center"
          >
            <img
              src={active.image}
              alt={title || ''}
              className="max-h-[min(62vh,720px)] w-auto max-w-full object-contain shadow-2xl"
              draggable={false}
            />
            {title ? (
              <p className="mt-3 text-center font-['Baloo_Tamma_2'] text-base font-semibold text-white sm:text-lg">
                {title}
              </p>
            ) : null}
            <p className="mt-1 text-xs text-white/60">
              {index + 1} / {total}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnail carousel — all posters; active highlighted */}
      <div className="shrink-0 border-t border-white/10 bg-black/50 px-3 py-3 sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-5xl gap-2.5 overflow-x-auto pb-1 scrollbar-none sm:gap-3">
          {posters.map((poster, i) => {
            const isActive = i === index
            const tip =
              language === 'en' ? poster.title.en : poster.title.kn
            return (
              <button
                key={poster.id}
                type="button"
                onClick={() => onChange(i)}
                title={tip}
                className={`relative h-16 w-12 shrink-0 overflow-hidden rounded-sm transition sm:h-20 sm:w-14 ${
                  isActive
                    ? 'ring-2 ring-offset-1 ring-offset-black scale-105'
                    : 'opacity-55 hover:opacity-90'
                }`}
                style={
                  isActive
                    ? { outlineColor: accent, boxShadow: `0 0 0 2px ${accent}` }
                    : undefined
                }
              >
                <img
                  src={poster.image}
                  alt={tip}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </button>
            )
          })}
        </div>
      </div>

      {/* Click backdrop to close (behind content) */}
      <button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0 -z-10 cursor-default"
        onClick={onClose}
      />
    </div>
  )
}
