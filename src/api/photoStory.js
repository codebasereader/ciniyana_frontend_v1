import { apiFetch } from './client'
import { withResolvedImage, withResolvedImages } from './media'

/**
 * Build multipart body for photo-story create/update.
 *
 * gallerySlots: ordered final gallery description
 *   - { kind: 'existing', src, captionEn, captionKn }
 *   - { kind: 'new', file, captionEn, captionKn }
 */
function buildPhotoStoryFormData(fields, imageFile, gallerySlots = []) {
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
    courtesyEn = '',
    courtesyKn = '',
    layout = 'landscape',
    galleryMode = 'stack',
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
  form.append('courtesyEn', courtesyEn)
  form.append('courtesyKn', courtesyKn)
  form.append('layout', layout)
  form.append('galleryMode', galleryMode)

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

export async function fetchPhotoStoryPosts() {
  const data = await apiFetch('/photo-story', { skipAuth: true })
  return withResolvedImages(data.posts || [])
}

export async function fetchPhotoStoryBySlug(slug) {
  const data = await apiFetch(`/photo-story/${encodeURIComponent(slug)}`, {
    skipAuth: true,
  })
  return {
    post: withResolvedImage(data.post),
    prev: withResolvedImage(data.prev),
    next: withResolvedImage(data.next),
    related: withResolvedImages(data.related || []),
  }
}

export async function createPhotoStoryPost(fields, imageFile, gallerySlots = []) {
  const data = await apiFetch('/photo-story', {
    method: 'POST',
    body: buildPhotoStoryFormData(fields, imageFile, gallerySlots),
  })
  return withResolvedImage(data.post)
}

export async function updatePhotoStoryPost(id, fields, imageFile, gallerySlots = []) {
  const data = await apiFetch(`/photo-story/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: buildPhotoStoryFormData(fields, imageFile, gallerySlots),
  })
  return withResolvedImage(data.post)
}

export async function deletePhotoStoryPost(id) {
  return apiFetch(`/photo-story/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export async function reorderPhotoStoryPosts(orderedIds) {
  const data = await apiFetch('/photo-story/reorder', {
    method: 'PUT',
    body: JSON.stringify({ orderedIds }),
  })
  return withResolvedImages(data.posts || [])
}
