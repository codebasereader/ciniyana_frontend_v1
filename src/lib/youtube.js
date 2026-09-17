const YOUTUBE_ID_PATTERN =
  /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

/** Pull the 11-char video id out of any standard YouTube URL shape. */
export function extractYouTubeId(url) {
  if (!url) return ''
  const match = String(url).match(YOUTUBE_ID_PATTERN)
  return match ? match[1] : ''
}

export function isValidYouTubeUrl(url) {
  return Boolean(extractYouTubeId(url))
}

/** hqdefault is guaranteed to exist for every YouTube video; higher qualities aren't. */
export function getYouTubeThumbnail(youtubeId, quality = 'hqdefault') {
  if (!youtubeId) return ''
  return `https://img.youtube.com/vi/${youtubeId}/${quality}.jpg`
}

export function getYouTubeEmbedUrl(youtubeId, { autoplay = false } = {}) {
  if (!youtubeId) return ''
  const params = new URLSearchParams({ rel: '0' })
  if (autoplay) params.set('autoplay', '1')
  return `https://www.youtube-nocookie.com/embed/${youtubeId}?${params.toString()}`
}
