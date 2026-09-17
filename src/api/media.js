import { API_BASE_URL } from '../../config.js'

/**
 * Turn API image paths into browser-loadable URLs.
 * Absolute http(s) URLs and Vite public paths (/menus/...) pass through.
 * Server paths like /images/... are prefixed with API_BASE_URL.
 */
export function resolveMediaUrl(src) {
  if (!src) return ''
  if (/^https?:\/\//i.test(src) || src.startsWith('blob:') || src.startsWith('data:')) {
    return src
  }
  if (src.startsWith('/images/')) {
    return `${API_BASE_URL}${src}`
  }
  return src
}

function resolveGallery(gallery = []) {
  return gallery.map((item) => ({
    ...item,
    src: resolveMediaUrl(item.src),
    caption: {
      kn: item.caption?.kn || '',
      en: item.caption?.en || '',
    },
  }))
}

/** Resolve hero + gallery (+ optional profile) image URLs on a post. */
export function withResolvedImage(post) {
  if (!post) return post
  const next = {
    ...post,
    image: resolveMediaUrl(post.image),
    gallery: resolveGallery(post.gallery || []),
  }
  if (post.profile) {
    next.profile = {
      ...post.profile,
      image: resolveMediaUrl(post.profile.image),
    }
  }
  return next
}

export function withResolvedImages(posts = []) {
  return posts.map(withResolvedImage)
}
