import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FadeIn } from '../../../components/motion'
import { selectLanguage } from '../../../store/slices/languageSlice'
import { photoStoryData } from '../../photo-story/data'
import { usePhotoStoryPosts } from '../../photo-story/usePhotoStoryPosts'
import { excerpt, pickLang } from '../utils'
import { HomePostCard, SectionDivider } from './SectionBits'

const BG = '#E8B84A'

export default function PhotoStorySection() {
  const language = useSelector(selectLanguage)
  const logo = language === 'en' ? photoStoryData.logos.en : photoStoryData.logos.kn
  const { posts: photoStoryPosts } = usePhotoStoryPosts()
  const posts = photoStoryPosts.slice(0, 3)

  return (
    <section className="relative w-full overflow-hidden" style={{ backgroundColor: BG }}>
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pt-4 pb-9 sm:px-6 sm:pt-5 sm:pb-12 lg:flex-row lg:items-start lg:gap-10 lg:pt-6 lg:pb-14">
        <div className="mx-auto flex w-full max-w-sm shrink-0 flex-col items-center text-center lg:mx-0 lg:w-[15rem] lg:items-start lg:pt-0 lg:text-left xl:w-[16.5rem]">
          <div className="flex w-fit flex-col items-center self-center lg:self-start">
            <Link
              to="/photo-story"
              className="w-[7.5rem] sm:w-[9rem] lg:w-[10rem]"
            >
              <img
                src={logo}
                alt={pickLang(photoStoryData.title, language)}
                className="h-auto w-full drop-shadow-[0_3px_10px_rgba(0,0,0,0.18)]"
                draggable={false}
              />
            </Link>
            <div className="mt-3 lg:mt-4">
              <SectionDivider />
            </div>
          </div>
          <p className="mt-3 font-['Baloo_Tamma_2'] text-sm leading-relaxed text-[#333] sm:text-[15px]">
            {pickLang(photoStoryData.description, language)}
          </p>
        </div>

        <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-5">
          {posts.map((post, i) => {
            const title = pickLang(post.title, language)
            return (
              <FadeIn key={post.id} delay={i * 0.05}>
                <HomePostCard
                  to={`/photo-story/${post.slug}`}
                  image={post.image}
                  title={title}
                  excerpt={excerpt(pickLang(post.body, language), 100)}
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
