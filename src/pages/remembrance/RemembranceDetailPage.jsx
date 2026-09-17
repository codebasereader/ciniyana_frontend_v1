import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { RemembranceDetail } from '../../components/posts'
import { SECTION_THEMES } from '../../components/section'
import { fetchRemembranceBySlug } from '../../api'
import { remembranceData } from './data'
import {
  getRemembranceAdjacent,
  getRemembrancePostBySlug,
  getRemembranceRelated,
} from './posts'

const BASE_PATH = '/remembrance'

function fromStatic(slug) {
  const post = getRemembrancePostBySlug(slug)
  if (!post) return null
  const { prev, next } = getRemembranceAdjacent(slug)
  return {
    post,
    prev,
    next,
    related: getRemembranceRelated(slug),
  }
}

export default function RemembranceDetailPage() {
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
        const data = await fetchRemembranceBySlug(slug)
        if (cancelled) return
        if (!data?.post) {
          const fallback = fromStatic(slug)
          setState({
            loading: false,
            data: fallback,
            notFound: !fallback,
          })
          return
        }
        setState({ loading: false, data, notFound: false })
      } catch {
        if (cancelled) return
        const fallback = fromStatic(slug)
        setState({
          loading: false,
          data: fallback,
          notFound: !fallback,
        })
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
  const theme = SECTION_THEMES[remembranceData.id] || {}
  const accent = theme.detailAccent || theme.logoBg || '#ff502f'

  return (
    <div className="w-full bg-[#faf7f2]">
      <RemembranceDetail
        post={post}
        basePath={BASE_PATH}
        accent={accent}
        sectionLogoKn={remembranceData.logos.kn}
        sectionLogoEn={remembranceData.logos.en}
        sectionLabelKn={remembranceData.title.kn}
        sectionLabelEn={remembranceData.title.en}
        related={related || []}
        prev={prev}
        next={next}
      />
    </div>
  )
}
