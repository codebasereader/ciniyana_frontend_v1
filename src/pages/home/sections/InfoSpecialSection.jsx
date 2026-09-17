import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FadeIn } from '../../../components/motion'
import { selectLanguage } from '../../../store/slices/languageSlice'
import { infoSpecialData } from '../../info-special/data'
import { useInfoSpecialPosts } from '../../info-special/useInfoSpecialPosts'
import { excerpt, pickLang } from '../utils'
import { HomePostCard, SectionDivider } from './SectionBits'

const BG = '#C5E0D0'

const BLURB = {
  kn: 'ಅಚ್ಚರಿ, ಅಪರೂಪದ ಸಿನಿಮಾರಂಗದ ಮಾಹಿತಿ – ವಿಶೇಷಗಳು. ವಿವಿಧ ಭಾಷೆಯ ಸಿನಿಮಾ, ನಟ-ನಟಿಯರು ಹಾಗೂ ತಂತ್ರಜ್ಞರ ಕುರಿತ ಪುಟ್ಟ ಬರಹಗಳು ಸಿನಿಮಾಸಕ್ತರ ಆಸಕ್ತಿಯನ್ನು ತಣಿಸಲಿವೆ. ಜೊತೆಗೆ ಸಿನಿಮಾ ಪ್ರೀತಿ ಹೆಚ್ಚಿಸಲಿವೆ.',
  en: 'Surprising, rare cinema information and specials. Short pieces on films in various languages, actors, actresses, and technicians — to satisfy cinephiles and deepen their love of cinema.',
}

export default function InfoSpecialSection() {
  const language = useSelector(selectLanguage)
  const logo = language === 'en' ? infoSpecialData.logos.en : infoSpecialData.logos.kn
  const { posts: infoSpecialPosts } = useInfoSpecialPosts()
  const posts = infoSpecialPosts.slice(0, 3)

  return (
    <section className="relative w-full overflow-hidden" style={{ backgroundColor: BG }}>
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pt-4 pb-9 sm:px-6 sm:pt-5 sm:pb-12 lg:flex-row lg:items-start lg:gap-10 lg:pt-6 lg:pb-14">
        <div className="mx-auto flex w-full max-w-sm shrink-0 flex-col items-center text-center lg:mx-0 lg:w-[15rem] lg:items-start lg:pt-0 lg:text-left xl:w-[16.5rem]">
          <div className="flex w-fit flex-col items-center self-center lg:self-start">
            <Link
              to="/info-special"
              className="w-[7.5rem] sm:w-[9rem] lg:w-[10rem]"
            >
              <img
                src={logo}
                alt={pickLang(infoSpecialData.title, language)}
                className="h-auto w-full drop-shadow-[0_3px_10px_rgba(0,0,0,0.15)]"
                draggable={false}
              />
            </Link>
            <div className="mt-3 lg:mt-4">
              <SectionDivider />
            </div>
          </div>
          <p className="mt-3 font-['Baloo_Tamma_2'] text-sm leading-relaxed text-[#444] sm:text-[15px]">
            {pickLang(BLURB, language)}
          </p>
        </div>

        <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-5">
          {posts.map((post, i) => {
            const title = pickLang(post.title, language)
            return (
              <FadeIn key={post.id} delay={i * 0.05}>
                <HomePostCard
                  to={`/info-special/${post.slug}`}
                  image={post.image}
                  title={title}
                  excerpt={excerpt(pickLang(post.body, language), 120)}
                  grayscale
                />
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
