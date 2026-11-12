import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { RemembranceDetail } from '../../components/posts'
import { SECTION_THEMES } from '../../components/section'
import { fetchFilmTodayBySlug } from '../../api'
import { filmTodayData } from './data'

const BASE_PATH = '/film-today'

export default function FilmTodayDetailPage() {
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
        const data = await fetchFilmTodayBySlug(slug)
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
  const theme = SECTION_THEMES[filmTodayData.id] || {}
  const accent = theme.detailAccent || theme.logoBg || '#ff502f'

  return (
    <div className="w-full bg-[#faf7f2]">
      <RemembranceDetail
        post={post}
        basePath={BASE_PATH}
        accent={accent}
        sectionLogoKn={filmTodayData.logos.kn}
        sectionLogoEn={filmTodayData.logos.en}
        sectionLabelKn={filmTodayData.title.kn}
        sectionLabelEn={filmTodayData.title.en}
        related={related || []}
        prev={prev}
        next={next}
      />
    </div>
  )
}
