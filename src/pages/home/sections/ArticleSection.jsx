import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FadeIn } from '../../../components/motion'
import { selectLanguage } from '../../../store/slices/languageSlice'
import { articleData } from '../../article/data'
import { articlePosts } from '../../article/posts'
import { excerpt, pickLang } from '../utils'
import { HomePostCard, SectionDivider } from './SectionBits'

const BG = '#FCE4EC'

export default function ArticleSection() {
  const language = useSelector(selectLanguage)
  const logo = language === 'en' ? articleData.logos.en : articleData.logos.kn
  const posts = articlePosts.slice(0, 2)

  return (
    <section
      className="relative h-full w-full overflow-hidden px-4 pt-4 pb-8 sm:px-5 sm:pt-5 sm:pb-10 lg:px-6 lg:pt-5 lg:pb-12"
      style={{ backgroundColor: BG }}
    >
      <div className="mb-5 flex flex-col items-center text-center sm:mb-6">
        <Link to="/article" className="w-[7.5rem] sm:w-[9rem] md:w-[10rem]">
          <img
            src={logo}
            alt={pickLang(articleData.title, language)}
            className="h-auto w-full drop-shadow-[0_3px_10px_rgba(0,0,0,0.12)]"
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
                to={`/article/${post.slug}`}
                image={post.image}
                title={title}
                excerpt={excerpt(pickLang(post.body, language), 100)}
                grayscale
              />
            </FadeIn>
          )
        })}
      </div>
    </section>
  )
}
