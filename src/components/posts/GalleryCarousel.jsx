import { useState } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { AnimatePresence, motion } from 'motion/react'
import { fadeCross } from '../motion/presets'

/**
 * End-of-article image carousel — caption sits ABOVE each slide.
 * Overlapping crossfade on light bg (no black flash).
 */
export default function GalleryCarousel({ slides = [], accent = '#2f7a5c' }) {
  const [index, setIndex] = useState(0)
  const total = slides.length

  if (!total) return null

  const go = (dir) => {
    setIndex((i) => (i + dir + total) % total)
  }

  const slide = slides[index]
  const caption = slide.caption || ''

  return (
    <div className="mt-10 w-full">
      <div className="relative overflow-hidden border border-[#e0d9cf] bg-white">
        {caption ? (
          <p className="border-b border-[#e8e0d6] bg-[#faf7f2] px-4 py-3 font-['Baloo_Tamma_2'] text-sm font-semibold leading-snug text-[#333] sm:px-5 sm:text-base">
            {caption}
          </p>
        ) : null}

        <div className="relative aspect-[16/10] w-full bg-[#ece8e1] sm:aspect-[16/9]">
          <AnimatePresence initial={false}>
            <motion.img
              key={slide.src}
              src={slide.src}
              alt={caption || ''}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: fadeCross.transition.ease }}
              className="absolute inset-0 h-full w-full object-contain"
              draggable={false}
            />
          </AnimatePresence>

          {total > 1 ? (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#333] shadow-sm hover:bg-white sm:left-3 sm:h-10 sm:w-10"
              >
                <FaChevronLeft className="text-sm" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next image"
                className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#333] shadow-sm hover:bg-white sm:right-3 sm:h-10 sm:w-10"
              >
                <FaChevronRight className="text-sm" />
              </button>
            </>
          ) : null}
        </div>
      </div>

      {total > 1 ? (
        <div className="mt-3 flex items-center justify-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              aria-label={`Go to image ${i + 1}`}
              onClick={() => setIndex(i)}
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor: i === index ? accent : '#ccc',
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
