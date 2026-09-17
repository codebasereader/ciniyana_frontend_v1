import { useCallback, useEffect, useState } from 'react'
import { fetchVideoPosts } from '../../api'

/**
 * Unlike every other section, this has no static-data fallback — video is
 * API-only. On failure the caller shows a real error + retry, nothing else.
 */
let cache = {
  posts: null,
  promise: null,
  error: null,
}

export function invalidateVideoCache() {
  cache = { posts: null, promise: null, error: null }
}

async function loadVideoPosts() {
  if (cache.posts) {
    return { posts: cache.posts, error: null }
  }

  if (!cache.promise) {
    cache.promise = fetchVideoPosts()
      .then((posts) => {
        cache.posts = posts
        cache.error = null
        return posts
      })
      .catch((err) => {
        cache.promise = null
        throw err
      })
  }

  try {
    const posts = await cache.promise
    return { posts, error: null }
  } catch (err) {
    const message = err.message || 'Failed to load videos'
    cache.error = message
    return { posts: [], error: message }
  }
}

export function useVideoPosts() {
  const [posts, setPosts] = useState(() => cache.posts || [])
  const [loading, setLoading] = useState(() => !cache.posts)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    invalidateVideoCache()
    setLoading(true)
    const result = await loadVideoPosts()
    setPosts(result.posts)
    setError(result.error)
    setLoading(false)
    return result
  }, [])

  useEffect(() => {
    let cancelled = false

    async function run() {
      if (cache.posts) {
        setPosts(cache.posts)
        setLoading(false)
        return
      }
      setLoading(true)
      const result = await loadVideoPosts()
      if (cancelled) return
      setPosts(result.posts)
      setError(result.error)
      setLoading(false)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  return { posts, loading, error, setPosts, reload }
}
