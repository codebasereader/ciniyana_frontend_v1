import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import KnockoutLogo from '../ui/KnockoutLogo'
import { LOGO_PATHS, TAGLINE } from '../../data/menus'
import { selectLanguage } from '../../store/slices/languageSlice'

/**
 * Primary brand mark.
 * Avoid w-full in flex rows — iOS Safari expands it to 100% and pushes siblings off-screen.
 */
export default function BrandLogo({ variant = 'desktop' }) {
  const language = useSelector(selectLanguage)
  const logoSrc = language === 'en' ? LOGO_PATHS.en : LOGO_PATHS.kn
  const isEn = language === 'en'
  const isMobile = variant === 'mobile'

  if (isMobile) {
    return (
      <div className="relative z-20 -mt-2.5 flex w-full min-w-0 max-w-[14.5rem] flex-col">
        <Link to="/" className="block w-[13.25rem] max-w-full self-start leading-none">
          <KnockoutLogo
            src={logoSrc}
            alt={isEn ? 'Ciniyaana' : 'ಸಿನಿಯಾನ'}
            className="h-[5.5rem] w-full drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)]"
          />
        </Link>
        <p className="-mt-3 w-[13.25rem] max-w-full self-start text-right text-[9px] font-semibold leading-tight text-white">
          {language === 'kn' ? TAGLINE.kn : TAGLINE.en}
        </p>
      </div>
    )
  }

  return (
    <div className="relative z-20 -ml-1 flex w-[17.5rem] shrink-0 flex-col sm:-ml-3 sm:w-[19rem] md:-ml-4 md:w-[21rem] lg:-ml-5 lg:w-[23rem]">
      <Link
        to="/"
        className="block w-full min-w-0 -mt-[2.65rem] sm:-mt-[3.85rem] md:-mt-[4.5rem] lg:-mt-[5.25rem]"
      >
        <KnockoutLogo
          src={logoSrc}
          alt={isEn ? 'Ciniyaana' : 'ಸಿನಿಯಾನ'}
          className="h-[4.6rem] w-full max-w-full drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] sm:h-[5.6rem] md:h-[6.6rem] lg:h-[7.8rem]"
        />
      </Link>

      <p className="-mt-1.5 w-full self-end pr-3 text-right text-xs font-semibold leading-snug text-[#EBC999] sm:-mt-2 sm:pr-5 sm:text-[13px] md:pr-6 md:text-sm lg:pr-8 lg:text-[15px]">
        {language === 'kn' ? TAGLINE.kn : TAGLINE.en}
      </p>
    </div>
  )
}
