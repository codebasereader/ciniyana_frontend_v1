import { Navigate, useParams } from 'react-router-dom'
import { PostDetail } from '../../components/posts'
import { flashBackData } from './data'
import {
  getFlashBackAdjacent,
  getFlashBackPostBySlug,
  getFlashBackRelated,
} from './posts'

const BASE_PATH = '/flash-back'

export default function FlashBackDetailPage() {
  const { slug } = useParams()
  const post = getFlashBackPostBySlug(slug)

  if (!post) {
    return <Navigate to={BASE_PATH} replace />
  }

  const { prev, next } = getFlashBackAdjacent(slug)
  const related = getFlashBackRelated(slug)

  return (
    <div className="w-full bg-white">
      <PostDetail
        post={post}
        basePath={BASE_PATH}
        sectionLogoKn={flashBackData.logos.kn}
        sectionLogoEn={flashBackData.logos.en}
        sectionLabelKn={flashBackData.title.kn}
        sectionLabelEn={flashBackData.title.en}
        related={related}
        prev={prev}
        next={next}
      />
    </div>
  )
}
