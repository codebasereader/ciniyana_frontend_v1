import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectLanguage } from '../../store/slices/languageSlice'

/**
 * Grid card — image + title. Scales with any number of posts.
 */
export default function PostCard({ post, basePath }) {
  const language = useSelector(selectLanguage)
  const title = language === 'en' ? post.title.en : post.title.kn

  return (
    <Link
      to={`${basePath}/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-sm border border-[#d8d8d8] bg-white shadow-sm hover:shadow-md"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-[#ece8e1]">
        <img
          src={post.image}
          alt={title}
          className="h-full w-full object-cover group-hover:scale-[1.02]"
          loading="lazy"
        />
      </div>
      <div className="px-3 py-3 sm:px-3.5 sm:py-3.5">
        <h3 className="font-['Baloo_Tamma_2'] text-sm font-semibold leading-snug text-[#2a2a2a] line-clamp-2 sm:text-[15px]">
          {title}
        </h3>
      </div>
    </Link>
  )
}
