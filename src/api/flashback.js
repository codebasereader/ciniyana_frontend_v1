import { apiFetch } from './client'
import { withResolvedImage, withResolvedImages } from './media'

function buildFlashBackFormData(fields, imageFile) {
  const form = new FormData()
  const {
    slug,
    date = '',
    titleEn,
    titleKn,
    bodyEn,
    bodyKn,
    categoryEn = '',
    categoryKn = '',
    photoCreditEn = '',
    photoCreditKn = '',
  } = fields

  form.append('slug', slug)
  form.append('date', date)
  form.append('titleEn', titleEn)
  form.append('titleKn', titleKn)
  form.append('bodyEn', bodyEn)
  form.append('bodyKn', bodyKn)
  form.append('categoryEn', categoryEn)
  form.append('categoryKn', categoryKn)
  form.append('photoCreditEn', photoCreditEn)
  form.append('photoCreditKn', photoCreditKn)

  if (imageFile) {
    form.append('image', imageFile)
  }

  return form
}

/** Public — list all Flash Back posts */
export async function fetchFlashBackPosts() {
  const data = await apiFetch('/flashback', { skipAuth: true })
  return withResolvedImages(data.posts || [])
}

/** Public — detail by slug + adjacent/related */
export async function fetchFlashBackBySlug(slug) {
  const data = await apiFetch(`/flashback/${encodeURIComponent(slug)}`, {
    skipAuth: true,
  })
  return {
    post: withResolvedImage(data.post),
    prev: withResolvedImage(data.prev),
    next: withResolvedImage(data.next),
    related: withResolvedImages(data.related || []),
  }
}

/** Admin — create */
export async function createFlashBackPost(fields, imageFile) {
  const data = await apiFetch('/flashback', {
    method: 'POST',
    body: buildFlashBackFormData(fields, imageFile),
  })
  return withResolvedImage(data.post)
}

/** Admin — update */
export async function updateFlashBackPost(id, fields, imageFile) {
  const data = await apiFetch(`/flashback/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: buildFlashBackFormData(fields, imageFile),
  })
  return withResolvedImage(data.post)
}

/** Admin — delete */
export async function deleteFlashBackPost(id) {
  return apiFetch(`/flashback/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

/**
 * Admin — persist display order.
 * @param {string[]} orderedIds ids from first → last (public list order)
 */
export async function reorderFlashBackPosts(orderedIds) {
  const data = await apiFetch('/flashback/reorder', {
    method: 'PUT',
    body: JSON.stringify({ orderedIds }),
  })
  return withResolvedImages(data.posts || [])
}
