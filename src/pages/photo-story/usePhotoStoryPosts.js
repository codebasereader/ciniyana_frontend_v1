import { useCallback, useEffect, useState } from 'react'
import { fetchPhotoStoryPosts } from '../../api'
import { photoStoryPosts as staticPosts } from './posts'

let cache = {
  posts: null,
  promise: null,
  error: null,
}

export function invalidatePhotoStoryCache() {
  cache = { posts: null, promise: null, error: null }
}

async function loadPhotoStoryPosts({ fallback = true } = {}) {
  if (cache.posts) {
    return { posts: cache.posts, fromApi: true, error: null }
  }

  if (!cache.promise) {
    cache.promise = fetchPhotoStoryPosts()
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
    return { posts, fromApi: true, error: null }
  } catch (err) {
    const message = err.message || 'Failed to load posts'
    cache.error = message
    if (fallback) {
      return { posts: staticPosts, fromApi: false, error: message }
    }
    return { posts: [], fromApi: false, error: message }
  }
}

export function usePhotoStoryPosts({ fallback = true } = {}) {
  const [posts, setPosts] = useState(() => cache.posts || (fallback ? staticPosts : []))
  const [loading, setLoading] = useState(() => !cache.posts)
  const [error, setError] = useState(null)
  const [fromApi, setFromApi] = useState(() => Boolean(cache.posts))

  const reload = useCallback(async () => {
    invalidatePhotoStoryCache()
    setLoading(true)
    const result = await loadPhotoStoryPosts({ fallback })
    setPosts(result.posts)
    setFromApi(result.fromApi)
    setError(result.error)
    setLoading(false)
    return result
  }, [fallback])

  useEffect(() => {
    let cancelled = false

    async function run() {
      if (cache.posts) {
        setPosts(cache.posts)
        setFromApi(true)
        setLoading(false)
        return
      }
      setLoading(true)
      const result = await loadPhotoStoryPosts({ fallback })
      if (cancelled) return
      setPosts(result.posts)
      setFromApi(result.fromApi)
      setError(result.error)
      setLoading(false)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [fallback])

  return { posts, loading, error, fromApi, setPosts, reload }
}
