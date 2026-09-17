import { useSelector } from 'react-redux'
import { selectLanguage } from '../../store/slices/languageSlice'

/** Same dimensions for every section logo */
const LOGO_BOX =
  'h-[5.25rem] w-[13.5rem] object-contain sm:h-[6rem] sm:w-[15.5rem] md:h-[6.75rem] md:w-[17.5rem] lg:h-[7.5rem] lg:w-[19.5rem]'

/**
 * Section hero — short colored bar; logo half on the bar, half hanging below.
 * Menu logos render as-is (black bg kept — e.g. remembrance_en.png).
 */
export default function SectionHero({
  logoKn,
  logoEn,
  titleKn,
  titleEn,
  descriptionKn,
  descriptionEn,
  logoBg = '#F0C9B8',
  logoPanelStyle = null,
}) {
  const language = useSelector(selectLanguage)
  const logoSrc = language === 'en' ? logoEn : logoKn
  const alt = language === 'en' ? titleEn : titleKn
  const description = language === 'en' ? descriptionEn : descriptionKn
  const panelStyle = logoPanelStyle || { backgroundColor: logoBg }

  return (
    <section className="relative z-0 w-full overflow-visible">
      <div className="flex w-full flex-col overflow-visible md:flex-row md:items-start">
        <div className="relative w-full shrink-0 overflow-visible md:w-[42%] lg:w-[40%]">
          <div className="relative overflow-visible">
            <div
              className="h-[4rem] sm:h-[4.5rem] md:h-[5rem] lg:h-[5.25rem]"
              style={panelStyle}
            />

            <div className="absolute left-1/2 top-full z-20 -translate-x-1/2 -translate-y-1/2">
              <img
                src={logoSrc}
                alt={alt}
                className={`${LOGO_BOX} select-none drop-shadow-[0_6px_14px_rgba(0,0,0,0.28)]`}
                draggable={false}
              />
              {/* Logo image carries the visual title; this gives the page a real text h1. */}
              <h1 className="sr-only">{alt}</h1>
            </div>
          </div>

          <div
            className="h-[2.75rem] sm:h-[3.25rem] md:h-[4rem] lg:h-[4.25rem]"
            aria-hidden="true"
          />
        </div>

        <div className="flex min-h-0 flex-1 items-start bg-white px-4 pt-1 pb-2 sm:min-h-[4.5rem] sm:px-6 sm:pt-3 sm:pb-3 md:min-h-[5rem] md:px-8 md:pt-2 lg:min-h-[5.25rem] lg:px-10">
          <p className="max-w-3xl font-['Baloo_Tamma_2'] text-base leading-relaxed text-[#333] sm:text-[17px] md:text-lg">
            {description}
          </p>
        </div>
      </div>
    </section>
  )
}
