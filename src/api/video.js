import { apiFetch } from './client'

/**
 * Video posts are YouTube-only: the admin pastes a URL and the backend
 * derives youtubeId + a thumbnail from it. No file upload, so this is
 * plain JSON — unlike the other (image-upload) sections' multipart APIs.
 */
function buildVideoPayload(fields) {
  const {
    slug = '',
    youtubeUrl,
    titleEn,
    titleKn,
    categoryEn = '',
    categoryKn = '',
    bodyEn = '',
    bodyKn = '',
    date = '',
  } = fields

  return {
    slug: slug.trim(),
    youtubeUrl,
    titleEn,
    titleKn,
    categoryEn,
    categoryKn,
    bodyEn,
    bodyKn,
    date,
  }
}

export async function fetchVideoPosts() {
  const data = await apiFetch('/video', { skipAuth: true })
  return data.posts || []
}

export async function fetchVideoBySlug(slug) {
  const data = await apiFetch(`/video/${encodeURIComponent(slug)}`, {
    skipAuth: true,
  })
  return {
    post: data.post,
    prev: data.prev,
    next: data.next,
    related: data.related || [],
  }
}

export async function createVideoPost(fields) {
  const data = await apiFetch('/video', {
    method: 'POST',
    body: JSON.stringify(buildVideoPayload(fields)),
  })
  return data.post
}

export async function updateVideoPost(id, fields) {
  const data = await apiFetch(`/video/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(buildVideoPayload(fields)),
  })
  return data.post
}

export async function deleteVideoPost(id) {
  return apiFetch(`/video/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export async function reorderVideoPosts(orderedIds) {
  const data = await apiFetch('/video/reorder', {
    method: 'PUT',
    body: JSON.stringify({ orderedIds }),
  })
  return data.posts || []
}
