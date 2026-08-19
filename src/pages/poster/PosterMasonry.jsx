import { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectLanguage } from '../../store/slices/languageSlice'
import { SECTION_THEMES } from '../../components/section'
import PosterLightbox from './PosterLightbox'

/**
 * Pinterest-style masonry wall — click opens lightbox (no detail route).
 */
export default function PosterMasonry({ posters }) {
  const language = useSelector(selectLanguage)
  const [activeIndex, setActiveIndex] = useState(null)
  const accent =
    SECTION_THEMES.poster?.detailAccent ||
    SECTION_THEMES.poster?.logoBg ||
    '#9a6b2f'

  return (
    <>
      <div className="columns-3 gap-3 sm:gap-4 lg:gap-5">
        {posters.map((poster, index) => {
          const title =
            language === 'en' ? poster.title.en : poster.title.kn
          return (
            <button
              key={poster.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="group mb-3 block w-full break-inside-avoid overflow-hidden rounded-sm bg-[#f3ebe0] text-left shadow-sm hover:shadow-md sm:mb-4"
            >
              <img
                src={poster.image}
                alt={title}
                className="block w-full object-cover group-hover:brightness-[0.97]"
                loading="lazy"
              />
              <div className="px-2.5 py-2 sm:px-3 sm:py-2.5">
                <span className="font-['Baloo_Tamma_2'] text-xs font-semibold leading-snug text-[#333] sm:text-sm">
                  {title}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {activeIndex != null ? (
        <PosterLightbox
          posters={posters}
          index={activeIndex}
          onClose={() => setActiveIndex(null)}
          onChange={setActiveIndex}
          accent={accent}
        />
      ) : null}
    </>
  )
}
