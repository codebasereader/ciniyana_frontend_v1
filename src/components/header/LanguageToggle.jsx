import { motion } from 'motion/react'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectLanguage,
  setLanguage,
} from '../../store/slices/languageSlice'

/**
 * EN / ಕನ್ನಡ language toggle — Redux + minimal Motion.
 * EN nudges in from the left; KN rises from below.
 */
export default function LanguageToggle({ variant = 'desktop' }) {
  const language = useSelector(selectLanguage)
  const dispatch = useDispatch()

  if (variant === 'mobile') {
    const selectedBtn =
      'bg-[#ac222b] text-[#EBC999]'
    const idleBtn = 'bg-transparent text-[#333]'

    return (
      <div
        className="inline-flex items-center overflow-hidden rounded-full border border-[#ddd] bg-white shadow-sm"
        role="group"
        aria-label="Language"
      >
        <button
          type="button"
          onClick={() => dispatch(setLanguage('en'))}
          className={`relative z-0 px-2.5 py-1 text-[10px] font-bold tracking-wide transition-colors ${
            language === 'en' ? selectedBtn : idleBtn
          }`}
          aria-pressed={language === 'en'}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => dispatch(setLanguage('kn'))}
          className={`relative z-0 px-2.5 py-1 text-[10px] font-bold transition-colors ${
            language === 'kn' ? selectedBtn : idleBtn
          }`}
          aria-pressed={language === 'kn'}
        >
          ಕನ್ನಡ
        </button>
      </div>
    )
  }

  return (
    <div
      className="flex shrink-0 flex-col overflow-hidden rounded-full border border-[#cfcfcf] bg-white shadow-sm"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => dispatch(setLanguage('en'))}
        className="relative px-2.5 py-1.5 text-xs font-bold tracking-wider sm:px-3 sm:text-[13px]"
        aria-pressed={language === 'en'}
      >
        {language === 'en' && (
          <motion.span
            layoutId="lang-highlight-desktop"
            className="absolute inset-0 bg-[#ac222b]"
            transition={{ type: 'spring', stiffness: 400, damping: 34 }}
          />
        )}
        <motion.span
          key={`en-d-${language === 'en'}`}
          initial={language === 'en' ? { x: -5, opacity: 0.45 } : false}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`relative z-10 inline-block ${
            language === 'en' ? 'text-[#EBC999]' : 'text-[#ac222b]'
          }`}
        >
          EN
        </motion.span>
      </button>

      <div className="relative z-10 h-px w-full bg-[#e0e0e0]" />

      <button
        type="button"
        onClick={() => dispatch(setLanguage('kn'))}
        className="relative px-2.5 py-1.5 text-[11px] font-bold leading-tight sm:px-3 sm:text-xs"
        aria-pressed={language === 'kn'}
      >
        {language === 'kn' && (
          <motion.span
            layoutId="lang-highlight-desktop"
            className="absolute inset-0 bg-[#ac222b]"
            transition={{ type: 'spring', stiffness: 400, damping: 34 }}
          />
        )}
        <motion.span
          key={`kn-d-${language === 'kn'}`}
          initial={language === 'kn' ? { y: 4, opacity: 0.45 } : false}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`relative z-10 inline-block ${
            language === 'kn' ? 'text-[#EBC999]' : 'text-[#ac222b]'
          }`}
        >
          ಕನ್ನಡ
        </motion.span>
      </button>
    </div>
  )
}
