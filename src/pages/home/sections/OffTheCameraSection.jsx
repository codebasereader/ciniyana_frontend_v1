import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FadeIn } from '../../../components/motion'
import { selectLanguage } from '../../../store/slices/languageSlice'
import { offTheCameraData } from '../../off-the-camera/data'
import { useOffTheCameraPosts } from '../../off-the-camera/useOffTheCameraPosts'
import { excerpt, pickLang } from '../utils'
import { HomePostCard, SectionDivider } from './SectionBits'

const BG = '#D4EEF5'

export default function OffTheCameraSection() {
  const language = useSelector(selectLanguage)
  const logo =
    language === 'en' ? offTheCameraData.logos.en : offTheCameraData.logos.kn
  const { posts: offTheCameraPosts } = useOffTheCameraPosts()
  const posts = offTheCameraPosts.slice(0, 2)

  return (
    <section
      className="relative h-full w-full overflow-hidden px-4 pt-4 pb-8 sm:px-5 sm:pt-5 sm:pb-10 lg:px-6 lg:pt-5 lg:pb-12"
      style={{ backgroundColor: BG }}
    >
      <div className="mb-5 flex flex-col items-center text-center sm:mb-6">
        <Link
          to="/off-the-camera"
          className="w-[8rem] sm:w-[9.5rem] md:w-[10.5rem]"
        >
          <img
            src={logo}
            alt={pickLang(offTheCameraData.title, language)}
            className="h-auto w-full drop-shadow-[0_3px_10px_rgba(0,0,0,0.15)]"
            draggable={false}
          />
        </Link>
        <div className="mt-3 w-full">
          <SectionDivider />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 lg:gap-5">
        {posts.map((post, i) => {
          const title = pickLang(post.title, language)
          return (
            <FadeIn key={post.id} delay={i * 0.05}>
              <HomePostCard
                to={`/off-the-camera/${post.slug}`}
                image={post.image}
                title={title}
                excerpt={excerpt(pickLang(post.body, language), 100)}
              />
            </FadeIn>
          )
        })}
      </div>
    </section>
  )
}
