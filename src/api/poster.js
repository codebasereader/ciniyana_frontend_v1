import { apiFetch } from './client'
import { withResolvedImage, withResolvedImages } from './media'

function slugify(text = '') {
  return String(text)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function buildPosterFormData(fields, imageFile) {
  const form = new FormData()
  const titleEn = fields.titleEn || ''
  const titleKn = fields.titleKn || ''
  const slug = (fields.slug || '').trim() || slugify(titleEn) || `poster-${Date.now()}`

  form.append('slug', slug)
  form.append('titleEn', titleEn)
  form.append('titleKn', titleKn)
  form.append('layout', 'poster')
  // Older backends still required body; unused in the UI.
  form.append('bodyEn', titleEn)
  form.append('bodyKn', titleKn)

  if (imageFile) {
    form.append('image', imageFile)
  }

  return form
}

export async function fetchPosterPosts() {
  const data = await apiFetch('/poster', { skipAuth: true })
  return withResolvedImages(data.posts || [])
}

export async function fetchPosterBySlug(slug) {
  const data = await apiFetch(`/poster/${encodeURIComponent(slug)}`, {
    skipAuth: true,
  })
  return {
    post: withResolvedImage(data.post),
    prev: withResolvedImage(data.prev),
    next: withResolvedImage(data.next),
    related: withResolvedImages(data.related || []),
  }
}

export async function createPosterPost(fields, imageFile) {
  const data = await apiFetch('/poster', {
    method: 'POST',
    body: buildPosterFormData(fields, imageFile),
  })
  return withResolvedImage(data.post)
}

export async function updatePosterPost(id, fields, imageFile) {
  const data = await apiFetch(`/poster/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: buildPosterFormData(fields, imageFile),
  })
  return withResolvedImage(data.post)
}

export async function deletePosterPost(id) {
  return apiFetch(`/poster/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export async function reorderPosterPosts(orderedIds) {
  const data = await apiFetch('/poster/reorder', {
    method: 'PUT',
    body: JSON.stringify({ orderedIds }),
  })
  return withResolvedImages(data.posts || [])
}
