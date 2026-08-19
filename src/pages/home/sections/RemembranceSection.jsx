import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FadeIn } from '../../../components/motion'
import { selectLanguage } from '../../../store/slices/languageSlice'
import { remembranceData } from '../../remembrance/data'
import { remembrancePosts } from '../../remembrance/posts'
import { excerpt, pickLang } from '../utils'

const BG = '#ff502f'

const BLURB = {
  kn: 'ಹಿರಿಯರ ನೆನಪಿನೊಂದಿಗೆ ಅವರ ಸಿನಿಮಾ ಸಾಧನೆಯನ್ನು ಸ್ಮರಿಸುವ ಅಂಕಣ.',
  en: 'A column that remembers veterans and celebrates their achievements in cinema.',
}

export default function RemembranceSection() {
  const language = useSelector(selectLanguage)
  const logo = language === 'en' ? remembranceData.logos.en : remembranceData.logos.kn
  const posts = remembrancePosts.slice(0, 3)

  return (
    <section className="relative w-full bg-white px-4 pt-3 pb-7 sm:px-6 sm:pt-4 sm:pb-9 lg:pt-5 lg:pb-11">
      <div
        className="mx-auto w-full max-w-6xl overflow-hidden rounded-2xl px-5 pt-4 pb-6 sm:rounded-3xl sm:px-7 sm:pt-5 sm:pb-7 md:px-9 md:pt-5 md:pb-8"
        style={{ backgroundColor: BG }}
      >
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-start sm:gap-5 md:gap-6">
          <Link
            to="/remembrance"
            className="w-[8rem] shrink-0 sm:w-[9.25rem] md:w-[10.5rem]"
          >
            <img
              src={logo}
              alt={pickLang(remembranceData.title, language)}
              className="h-auto w-full drop-shadow-[0_3px_10px_rgba(0,0,0,0.22)]"
              draggable={false}
            />
          </Link>
          <p className="max-w-2xl text-center font-['Baloo_Tamma_2'] text-sm leading-snug text-white sm:text-left sm:text-[15px] md:text-base">
            {pickLang(BLURB, language)}
          </p>
        </div>

        <div className="mt-3 flex justify-center sm:mt-4 sm:justify-start" aria-hidden="true">
          <img
            src="/divider.svg"
            alt=""
            className="h-5 w-auto max-w-[10rem] object-contain brightness-0 sm:h-6 sm:max-w-[12rem]"
            draggable={false}
          />
        </div>

        <div className="mt-5 grid gap-5 sm:mt-7 sm:grid-cols-3 sm:gap-6 md:gap-8">
          {posts.map((post, i) => {
            const title = pickLang(post.title, language)
            return (
              <FadeIn key={post.id} delay={i * 0.05}>
                <Link
                  to={`/remembrance/${post.slug}`}
                  className="group flex items-start gap-3.5 sm:gap-4"
                >
                  <div className="relative h-[6.5rem] w-[7rem] shrink-0 overflow-hidden rounded-full border-2 border-white/85 shadow-[0_4px_14px_rgba(0,0,0,0.22)] sm:h-[7.25rem] sm:w-[7.75rem] md:h-[8rem] md:w-[8.5rem]">
                    <img
                      src={post.image}
                      alt={title}
                      className="h-full w-full object-cover grayscale transition duration-300 group-hover:scale-[1.04] group-hover:grayscale-0"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <h3 className="font-['Baloo_Tamma_2'] text-[15px] font-bold leading-snug text-white group-hover:underline sm:text-base">
                      {title}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-white/90 line-clamp-3 sm:text-sm">
                      {excerpt(pickLang(post.body, language), 100)}
                    </p>
                  </div>
                </Link>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
