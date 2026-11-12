import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { RemembranceDetail } from '../../components/posts'
import { SECTION_THEMES } from '../../components/section'
import { fetchPhotoStoryBySlug } from '../../api'
import { photoStoryData } from './data'

const BASE_PATH = '/photo-story'

export default function PhotoStoryDetailPage() {
  const { slug } = useParams()
  const [state, setState] = useState({
    loading: true,
    data: null,
    notFound: false,
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      setState({ loading: true, data: null, notFound: false })
      try {
        const data = await fetchPhotoStoryBySlug(slug)
        if (cancelled) return
        if (!data?.post) {
          setState({ loading: false, data: null, notFound: true })
          return
        }
        setState({ loading: false, data, notFound: false })
      } catch {
        if (cancelled) return
        setState({ loading: false, data: null, notFound: true })
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (state.loading) {
    return (
      <div className="w-full bg-[#faf7f2] px-4 py-16 text-center text-sm text-[#666]">
        Loading…
      </div>
    )
  }

  if (state.notFound || !state.data?.post) {
    return <Navigate to={BASE_PATH} replace />
  }

  const { post, prev, next, related } = state.data
  const theme = SECTION_THEMES[photoStoryData.id] || {}
  const accent = theme.detailAccent || theme.logoBg || '#ff502f'

  return (
    <div className="w-full bg-[#faf7f2]">
      <RemembranceDetail
        post={post}
        basePath={BASE_PATH}
        accent={accent}
        sectionLogoKn={photoStoryData.logos.kn}
        sectionLogoEn={photoStoryData.logos.en}
        sectionLabelKn={photoStoryData.title.kn}
        sectionLabelEn={photoStoryData.title.en}
        related={related || []}
        prev={prev}
        next={next}
      />
    </div>
  )
}
