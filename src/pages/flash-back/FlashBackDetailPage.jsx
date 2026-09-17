import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { PostDetail } from '../../components/posts'
import { fetchFlashBackBySlug } from '../../api'
import { flashBackData } from './data'
import {
  getFlashBackAdjacent,
  getFlashBackPostBySlug,
  getFlashBackRelated,
} from './posts'

const BASE_PATH = '/flash-back'

function fromStatic(slug) {
  const post = getFlashBackPostBySlug(slug)
  if (!post) return null
  const { prev, next } = getFlashBackAdjacent(slug)
  return {
    post,
    prev,
    next,
    related: getFlashBackRelated(slug),
  }
}

export default function FlashBackDetailPage() {
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
        const data = await fetchFlashBackBySlug(slug)
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
      <div className="w-full bg-white px-4 py-16 text-center text-sm text-[#666]">
        Loading…
      </div>
    )
  }

  if (state.notFound || !state.data?.post) {
    return <Navigate to={BASE_PATH} replace />
  }

  const { post, prev, next, related } = state.data

  return (
    <div className="w-full bg-white">
      <PostDetail
        post={post}
        basePath={BASE_PATH}
        sectionLogoKn={flashBackData.logos.kn}
        sectionLogoEn={flashBackData.logos.en}
        sectionLabelKn={flashBackData.title.kn}
        sectionLabelEn={flashBackData.title.en}
        related={related || []}
        prev={prev}
        next={next}
      />
    </div>
  )
}
