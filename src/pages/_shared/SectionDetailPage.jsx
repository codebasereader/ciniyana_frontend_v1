import { Navigate, useParams } from 'react-router-dom'
import { RemembranceDetail } from '../../components/posts'
import { SECTION_THEMES } from '../../components/section'

/**
 * Shared detail page shell for themed section posts.
 */
export default function SectionDetailPage({
  basePath,
  data,
  getPostBySlug,
  getAdjacent,
  getRelated,
}) {
  const { slug } = useParams()
  const post = getPostBySlug(slug)

  if (!post) {
    return <Navigate to={basePath} replace />
  }

  const { prev, next } = getAdjacent(slug)
  const related = getRelated(slug)
  const theme = SECTION_THEMES[data.id] || {}
  const accent = theme.detailAccent || theme.logoBg || '#ff502f'

  return (
    <div className="w-full bg-[#faf7f2]">
      <RemembranceDetail
        post={post}
        basePath={basePath}
        accent={accent}
        sectionLogoKn={data.logos.kn}
        sectionLogoEn={data.logos.en}
        sectionLabelKn={data.title.kn}
        sectionLabelEn={data.title.en}
        related={related}
        prev={prev}
        next={next}
      />
    </div>
  )
}
