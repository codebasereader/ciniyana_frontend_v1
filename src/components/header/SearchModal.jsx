import { useEffect, useId, useRef, useState } from 'react'
import { FaSearch, FaTimes } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import { selectLanguage } from '../../store/slices/languageSlice'

/**
 * Static search dialog — UI only until backend search is wired.
 */
export default function SearchModal({ open, onClose }) {
  const language = useSelector(selectLanguage)
  const titleId = useId()
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const isKn = language === 'kn'
  const title = isKn ? 'ಹುಡುಕಿ' : 'Search'
  const placeholder = isKn ? 'ಚಲನಚಿತ್ರ, ಲೇಖನ, ಹೆಸರು...' : 'Film, article, name...'
  const buttonLabel = isKn ? 'ಹುಡುಕಿ' : 'Search'
  const hint = isKn
    ? 'ಹುಡುಕಾಟ ಶೀಘ್ರದಲ್ಲೇ ಲಭ್ಯವಾಗಲಿದೆ. ಇದೀಗ ನೀವು ಪದಗಳನ್ನು ನಮೂದಿಸಬಹುದು.'
    : 'Search will be available soon. You can type a query for now.'
  const submittedMsg = isKn
    ? 'ಹುಡುಕಾಟ ಇನ್ನೂ ಸಕ್ರಿಯವಾಗಿಲ್ಲ. ಬ್ಯಾಕೆಂಡ್ ಸೇರಿದ ನಂತರ ಫಲಿತಾಂಶಗಳು ತೋರುತ್ತವೆ.'
    : 'Search is not live yet. Results will appear once the backend is connected.'

  useEffect(() => {
    if (!open) return undefined

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    setQuery('')
    setSubmitted(false)

    const timer = window.setTimeout(() => inputRef.current?.focus(), 40)

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      window.clearTimeout(timer)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const onSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[18vh] sm:pt-[22vh]">
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label={isKn ? 'ಮುಚ್ಚಿ' : 'Close search'}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.28)]"
      >
        <div className="flex items-center justify-between border-b border-black/8 bg-[#ac222b] px-4 py-3">
          <h2
            id={titleId}
            className="font-['Baloo_Tamma_2'] text-lg font-bold text-white"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
            aria-label={isKn ? 'ಮುಚ್ಚಿ' : 'Close'}
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="px-4 py-5 sm:px-5">
          <label className="sr-only" htmlFor="site-search-input">
            {title}
          </label>
          <div className="flex items-stretch gap-2">
            <div className="relative min-w-0 flex-1">
              <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#888]" />
              <input
                id="site-search-input"
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setSubmitted(false)
                }}
                placeholder={placeholder}
                className="h-11 w-full rounded-lg border border-[#d8d0c6] bg-[#faf7f2] pl-9 pr-3 text-sm text-[#222] outline-none ring-[#ac222b] placeholder:text-[#999] focus:border-[#ac222b] focus:ring-2"
              />
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-[#ac222b] px-4 text-sm font-bold text-white hover:bg-[#961d25]"
            >
              {buttonLabel}
            </button>
          </div>

          <p className="mt-3 text-[13px] leading-relaxed text-[#666]">
            {submitted ? submittedMsg : hint}
          </p>
        </form>
      </div>
    </div>
  )
}
