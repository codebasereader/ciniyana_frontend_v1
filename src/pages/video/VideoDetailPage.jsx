import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { VideoDetail } from '../../components/posts'
import { SECTION_THEMES } from '../../components/section'
import { fetchVideoBySlug } from '../../api'
import { videoData } from './data'

const BASE_PATH = '/video'

export default function VideoDetailPage() {
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
        const data = await fetchVideoBySlug(slug)
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
      <div className="w-full bg-white px-4 py-16 text-center text-sm text-[#666]">
        Loading…
      </div>
    )
  }

  if (state.notFound || !state.data?.post) {
    return <Navigate to={BASE_PATH} replace />
  }

  const { post, prev, next, related } = state.data
  const theme = SECTION_THEMES[videoData.id] || {}
  const accent = theme.detailAccent || theme.logoBg

  return (
    <div className="w-full bg-white">
      <VideoDetail
        post={post}
        basePath={BASE_PATH}
        accent={accent}
        sectionLogoKn={videoData.logos.kn}
        sectionLogoEn={videoData.logos.en}
        sectionLabelKn={videoData.title.kn}
        sectionLabelEn={videoData.title.en}
        related={related || []}
        prev={prev}
        next={next}
      />
    </div>
  )
}
