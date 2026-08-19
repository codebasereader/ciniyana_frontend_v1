import { AnimatePresence, motion } from 'motion/react'
import { fadeCross } from './presets'

/**
 * Soft image crossfade — overlapping (no wait gap), light placeholder (no black flash).
 */
export default function CrossfadeImage({
  src,
  alt = '',
  className = '',
  imgClassName = '',
  duration = 0.4,
}) {
  return (
    <div className={`relative overflow-hidden bg-[#ece8e1] ${className}`}>
      <AnimatePresence initial={false}>
        <motion.img
          key={src}
          src={src}
          alt={alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration, ease: fadeCross.transition.ease }}
          className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
          draggable={false}
        />
      </AnimatePresence>
    </div>
  )
}
