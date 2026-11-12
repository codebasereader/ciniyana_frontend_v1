import { useCallback, useEffect, useState } from 'react'
import { fetchOffTheCameraPosts } from '../../api'

let cache = {
  posts: null,
  promise: null,
  error: null,
}

export function invalidateOffTheCameraCache() {
  cache = { posts: null, promise: null, error: null }
}

async function loadOffTheCameraPosts() {
  if (cache.posts) {
    return { posts: cache.posts, error: null }
  }

  if (!cache.promise) {
    cache.promise = fetchOffTheCameraPosts()
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
    const message = err.message || 'Failed to load posts'
    cache.error = message
    return { posts: [], error: message }
  }
}

export function useOffTheCameraPosts() {
  const [posts, setPosts] = useState(() => cache.posts || [])
  const [loading, setLoading] = useState(() => !cache.posts)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    invalidateOffTheCameraCache()
    setLoading(true)
    const result = await loadOffTheCameraPosts()
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
      const result = await loadOffTheCameraPosts()
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
