import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FaHome } from 'react-icons/fa'
import { Seo } from '../../components/seo'
import { selectLanguage } from '../../store/slices/languageSlice'

const COPY = {
  kn: {
    title: 'ಪುಟ ಸಿಗಲಿಲ್ಲ',
    body: 'ನೀವು ಹುಡುಕುತ್ತಿರುವ ಪುಟ ಇಲ್ಲಿ ಇಲ್ಲ. ಅದನ್ನು ಸರಿಸಲಾಗಿದೆ ಅಥವಾ ಅಳಿಸಲಾಗಿದೆ.',
    cta: 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ',
  },
  en: {
    title: 'Page not found',
    body: "The page you're looking for doesn't exist. It may have been moved or removed.",
    cta: 'Back to home',
  },
}

/** Catch-all for any URL that doesn't match a real route. */
export default function NotFoundPage() {
  const language = useSelector(selectLanguage)
  const copy = COPY[language] || COPY.kn

  return (
    <div className="flex w-full flex-col items-center justify-center bg-[#faf7f2] px-4 py-20 text-center sm:py-28">
      <Seo title={copy.title} noindex />
      <p className="font-['Baloo_Tamma_2'] text-6xl font-extrabold text-[#8B1E22] sm:text-7xl">
        404
      </p>
      <h1 className="mt-3 font-['Baloo_Tamma_2'] text-xl font-bold text-[#222] sm:text-2xl">
        {copy.title}
      </h1>
      <p className="mt-2 max-w-md text-sm text-[#555] sm:text-base">{copy.body}</p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#8B1E22] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#6f171a]"
      >
        <FaHome className="text-xs" />
        {copy.cta}
      </Link>
    </div>
  )
}
