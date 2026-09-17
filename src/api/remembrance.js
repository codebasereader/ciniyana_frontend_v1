import { apiFetch } from './client'
import { withResolvedImage, withResolvedImages } from './media'

/**
 * Build multipart body for remembrance create/update.
 *
 * gallerySlots: ordered final gallery description
 *   - { kind: 'existing', src, captionEn, captionKn }
 *   - { kind: 'new', file, captionEn, captionKn }
 */
function buildRemembranceFormData(fields, imageFile, gallerySlots = []) {
  const form = new FormData()
  const {
    slug,
    date = '',
    titleEn,
    titleKn,
    subtitleEn = '',
    subtitleKn = '',
    bodyEn,
    bodyKn,
    categoryEn = '',
    categoryKn = '',
    photoCreditEn = '',
    photoCreditKn = '',
    courtesyEn = '',
    courtesyKn = '',
  } = fields

  form.append('slug', slug)
  form.append('date', date)
  form.append('titleEn', titleEn)
  form.append('titleKn', titleKn)
  form.append('subtitleEn', subtitleEn)
  form.append('subtitleKn', subtitleKn)
  form.append('bodyEn', bodyEn)
  form.append('bodyKn', bodyKn)
  form.append('categoryEn', categoryEn)
  form.append('categoryKn', categoryKn)
  form.append('photoCreditEn', photoCreditEn)
  form.append('photoCreditKn', photoCreditKn)
  form.append('courtesyEn', courtesyEn)
  form.append('courtesyKn', courtesyKn)

  if (imageFile) {
    form.append('image', imageFile)
  }

  const galleryOrder = []
  let newIndex = 0

  gallerySlots.forEach((slot) => {
    if (slot.kind === 'existing') {
      galleryOrder.push({
        kind: 'existing',
        src: slot.src,
        captionEn: slot.captionEn || '',
        captionKn: slot.captionKn || '',
      })
      return
    }
    if (slot.kind === 'new' && slot.file) {
      form.append('gallery', slot.file)
      galleryOrder.push({
        kind: 'new',
        fileIndex: newIndex,
        captionEn: slot.captionEn || '',
        captionKn: slot.captionKn || '',
      })
      newIndex += 1
    }
  })

  form.append('galleryOrder', JSON.stringify(galleryOrder))

  return form
}

export async function fetchRemembrancePosts() {
  const data = await apiFetch('/remembrance', { skipAuth: true })
  return withResolvedImages(data.posts || [])
}

export async function fetchRemembranceBySlug(slug) {
  const data = await apiFetch(`/remembrance/${encodeURIComponent(slug)}`, {
    skipAuth: true,
  })
  return {
    post: withResolvedImage(data.post),
    prev: withResolvedImage(data.prev),
    next: withResolvedImage(data.next),
    related: withResolvedImages(data.related || []),
  }
}

export async function createRemembrancePost(fields, imageFile, gallerySlots = []) {
  const data = await apiFetch('/remembrance', {
    method: 'POST',
    body: buildRemembranceFormData(fields, imageFile, gallerySlots),
  })
  return withResolvedImage(data.post)
}

export async function updateRemembrancePost(id, fields, imageFile, gallerySlots = []) {
  const data = await apiFetch(`/remembrance/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: buildRemembranceFormData(fields, imageFile, gallerySlots),
  })
  return withResolvedImage(data.post)
}

export async function deleteRemembrancePost(id) {
  return apiFetch(`/remembrance/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export async function reorderRemembrancePosts(orderedIds) {
  const data = await apiFetch('/remembrance/reorder', {
    method: 'PUT',
    body: JSON.stringify({ orderedIds }),
  })
  return withResolvedImages(data.posts || [])
}
