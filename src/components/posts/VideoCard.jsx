import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FaPlay } from 'react-icons/fa'
import { selectLanguage } from '../../store/slices/languageSlice'

/** Grid card — thumbnail + play badge + title. Click navigates to the video's detail page. */
export default function VideoCard({ post, basePath }) {
  const language = useSelector(selectLanguage)
  const title = language === 'en' ? post.title.en : post.title.kn

  return (
    <Link
      to={`${basePath}/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-sm border border-[#d8d8d8] bg-white shadow-sm hover:shadow-md"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-[#ece8e1]">
        <img
          src={post.image}
          alt={title}
          className="h-full w-full object-cover group-hover:scale-[1.02]"
          loading="lazy"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/30">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ff0000] text-white shadow-md sm:h-12 sm:w-12">
            <FaPlay className="ml-0.5 text-base sm:text-lg" aria-hidden="true" />
          </span>
        </span>
      </div>
      <div className="px-3 py-3 sm:px-3.5 sm:py-3.5">
        <h3 className="font-['Baloo_Tamma_2'] text-sm font-semibold leading-snug text-[#2a2a2a] line-clamp-2 sm:text-[15px]">
          {title}
        </h3>
      </div>
    </Link>
  )
}
