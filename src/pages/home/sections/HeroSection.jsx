import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectLanguage } from '../../../store/slices/languageSlice'
import { CREAM_MINT_STRIPE } from '../../../components/section/sectionThemes'
import { flashBackData } from '../../flash-back/data'
import { useFlashBackPosts } from '../../flash-back/useFlashBackPosts'
import { filmTodayData } from '../../film-today/data'
import { useFilmTodayPosts } from '../../film-today/useFilmTodayPosts'
import { excerpt, pickLang } from '../utils'
import { useAutoCarousel } from '../useAutoCarousel'

export default function HeroSection() {
  const language = useSelector(selectLanguage)
  const [fbPaused, setFbPaused] = useState(false)
  const [ctPaused, setCtPaused] = useState(false)
  const { posts: flashBackPosts } = useFlashBackPosts()
  const { posts: filmTodayPosts } = useFilmTodayPosts()

  const [fbIndex, setFbIndex] = useAutoCarousel(flashBackPosts.length, {
    intervalMs: 5000,
    paused: fbPaused,
  })
  const [ctIndex, setCtIndex] = useAutoCarousel(filmTodayPosts.length, {
    intervalMs: 4200,
    paused: ctPaused,
  })

  const fbPost = flashBackPosts[fbIndex]
  const ctPost = filmTodayPosts[ctIndex]

  const fbLogo = language === 'en' ? flashBackData.logos.en : flashBackData.logos.kn
  const ctLogo = language === 'en' ? filmTodayData.logos.en : filmTodayData.logos.kn

  return (
    <section className="relative w-full overflow-hidden bg-white">
      <div className="mx-auto grid max-w-7xl gap-3 px-0 pt-0 pb-5 sm:gap-6 sm:px-6 sm:py-8 lg:grid-cols-[2fr_1fr] lg:items-stretch lg:gap-6 lg:py-10">
        {/* Flash back — full-bleed under header on mobile */}
        <div
          className="relative flex min-w-0 flex-col overflow-visible rounded-none px-3 pb-2.5 pt-3 sm:rounded-[1.25rem] sm:px-6 sm:pb-5 sm:pt-8 lg:px-8 lg:pb-6 lg:pt-9"
          style={CREAM_MINT_STRIPE}
          onMouseEnter={() => setFbPaused(true)}
          onMouseLeave={() => setFbPaused(false)}
        >
          <div className="relative flex-1">
            <div className="h-4 sm:h-5 md:h-6" aria-hidden="true" />

            <div className="relative mx-auto w-[88%] max-w-full sm:w-full sm:max-w-[98%]">
              <Link
                to="/flash-back"
                className={`absolute left-0 top-0 z-20 ${
                  language === 'en'
                    ? 'w-[5rem] -translate-y-[30%] sm:w-[8.4rem] sm:-translate-y-[38%] md:w-[9.2rem] lg:w-[10.1rem]'
                    : 'w-[7rem] -translate-y-[42%] sm:w-[11.4rem] sm:-translate-y-1/2 md:w-[12.8rem] lg:w-[14.1rem]'
                }`}
              >
                <img
                  src={fbLogo}
                  alt={pickLang(flashBackData.title, language)}
                  className="h-auto w-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                  draggable={false}
                />
              </Link>

              {fbPost ? (
                <Link
                  to={`/flash-back/${fbPost.slug}`}
                  className="group relative block overflow-hidden rounded-xl bg-[#ece8e1] shadow-[0_8px_28px_rgba(0,0,0,0.12)] sm:rounded-2xl"
                >
                  <img
                    src={fbPost.image}
                    alt={pickLang(fbPost.title, language)}
                    className="aspect-[16/10] w-full object-cover grayscale sm:aspect-[16/9]"
                    draggable={false}
                  />
                </Link>
              ) : (
                <div className="aspect-[16/10] rounded-xl bg-[#ece8e1] sm:aspect-[16/9] sm:rounded-2xl" />
              )}
            </div>
          </div>

          <div className="mt-2 text-center sm:mt-5">
            {fbPost ? (
              <Link to={`/flash-back/${fbPost.slug}`} className="group block">
                <h2 className="font-['Baloo_Tamma_2'] text-[15px] font-bold leading-snug text-[#2f7a5c] group-hover:text-[#ac222b] sm:text-lg">
                  {pickLang(fbPost.title, language)}
                </h2>
              </Link>
            ) : null}

            {flashBackPosts.length > 1 ? (
              <div className="mt-1.5 flex items-center justify-center gap-2 sm:mt-2.5">
                {flashBackPosts.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-label={`Flash back ${i + 1}`}
                    onClick={() => setFbIndex(i)}
                    className="h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5"
                    style={{
                      backgroundColor: i === fbIndex ? '#ac222b' : 'rgba(0,0,0,0.25)',
                    }}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div
          className="relative flex min-w-0 flex-col bg-white px-4 pt-0 pb-2 sm:px-1 sm:py-2 lg:py-1"
          onMouseEnter={() => setCtPaused(true)}
          onMouseLeave={() => setCtPaused(false)}
        >
          <div className="flex min-w-0 items-center gap-2 sm:gap-2.5 md:gap-3">
            <Link
              to="/film-today"
              className="inline-flex w-[6.25rem] shrink-0 sm:w-[7rem] md:w-[7.75rem]"
            >
              <img
                src={ctLogo}
                alt={pickLang(filmTodayData.title, language)}
                className="h-auto w-full drop-shadow-[0_2px_6px_rgba(0,0,0,0.15)]"
                draggable={false}
              />
            </Link>

            <div
              className={`min-w-0 flex-1 font-['Baloo_Tamma_2'] leading-tight ${
                language === 'en' ? '-ml-2 sm:-ml-2.5 md:-ml-3' : ''
              }`}
            >
              <p
                className={`font-bold text-[#666] ${
                  language === 'en'
                    ? 'whitespace-nowrap text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px]'
                    : 'text-[12px] sm:text-[13px] md:text-sm'
                }`}
              >
                {language === 'en'
                  ? 'Current happenings in the Kannada film industry,'
                  : 'ಕನ್ನಡ ಸಿನಿಜಗತ್ತಿನ ಪ್ರಸ್ತುತ ವಿದ್ಯಮಾನಗಳು,'}
              </p>
              <p
                className={`mt-0.5 font-bold text-[#666] ${
                  language === 'en'
                    ? 'text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px]'
                    : 'text-[11px] sm:text-xs md:text-[13px]'
                }`}
              >
                {language === 'en'
                  ? 'along with articles, reviews, and analysis.'
                  : 'ಲೇಖನ - ವಿಮರ್ಶೆ - ವಿಶ್ಲೇಷಣೆ'}
              </p>
            </div>
          </div>

          <div className="my-2.5 flex justify-center sm:my-3" aria-hidden="true">
            <img
              src="/divider.svg"
              alt=""
              className="h-5 w-auto max-w-[11rem] object-contain opacity-80 sm:h-6 sm:max-w-[12rem]"
              draggable={false}
            />
          </div>

          {ctPost ? (
            <Link
              to={`/film-today/${ctPost.slug}`}
              className="group relative mx-auto block w-full max-w-full overflow-hidden rounded-lg bg-[#ece8e1] shadow-[0_8px_24px_rgba(0,0,0,0.1)] sm:max-w-[92%]"
            >
              <img
                src={ctPost.image}
                alt={pickLang(ctPost.title, language)}
                className="aspect-[16/10] w-full object-cover sm:aspect-[16/9]"
                draggable={false}
              />
            </Link>
          ) : (
            <div className="mx-auto aspect-[16/10] w-full max-w-full rounded-lg bg-[#ece8e1] sm:aspect-[16/9] sm:max-w-[92%]" />
          )}

          <div className="mt-3 flex flex-1 flex-col sm:mt-3.5">
            {ctPost ? (
              <Link to={`/film-today/${ctPost.slug}`} className="group block">
                <h3 className="font-['Baloo_Tamma_2'] text-[15px] font-extrabold leading-snug text-[#1a1a1a] group-hover:text-[#c2185b] sm:text-base">
                  {pickLang(ctPost.title, language)}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[#555] line-clamp-2 sm:text-sm">
                  {excerpt(pickLang(ctPost.body, language), 100)}
                </p>
              </Link>
            ) : null}

            {filmTodayPosts.length > 1 ? (
              <div className="mt-auto flex items-center justify-center gap-2 pt-4">
                {filmTodayPosts.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-label={`Cinema today ${i + 1}`}
                    onClick={() => setCtIndex(i)}
                    className="h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5"
                    style={{
                      backgroundColor: i === ctIndex ? '#c2185b' : 'rgba(0,0,0,0.22)',
                    }}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
