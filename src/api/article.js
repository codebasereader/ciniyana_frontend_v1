import { apiFetch } from './client'
import { withResolvedImage, withResolvedImages } from './media'

/**
 * Build multipart body for article create/update.
 *
 * gallerySlots: ordered final gallery description
 *   - { kind: 'existing', src, captionEn, captionKn, afterParagraph }
 *   - { kind: 'new', file, captionEn, captionKn, afterParagraph }
 *
 * profileImageFile: optional File for contributor photo
 * clearProfileImage: when true on update, tell server to remove profile photo
 */
function buildArticleFormData(
  fields,
  imageFile,
  gallerySlots = [],
  { profileImageFile, clearProfileImage = false } = {},
) {
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
    layout = 'landscape',
    galleryMode = 'interleave',
    profileNameEn = '',
    profileNameKn = '',
    profileRoleEn = '',
    profileRoleKn = '',
    profileIntroEn = '',
    profileIntroKn = '',
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
  form.append('layout', layout)
  form.append('galleryMode', galleryMode)
  form.append('profileNameEn', profileNameEn)
  form.append('profileNameKn', profileNameKn)
  form.append('profileRoleEn', profileRoleEn)
  form.append('profileRoleKn', profileRoleKn)
  form.append('profileIntroEn', profileIntroEn)
  form.append('profileIntroKn', profileIntroKn)

  if (imageFile) {
    form.append('image', imageFile)
  }

  if (profileImageFile) {
    form.append('profileImage', profileImageFile)
  }

  if (clearProfileImage) {
    form.append('clearProfileImage', 'true')
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
        afterParagraph: Number(slot.afterParagraph) || undefined,
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
        afterParagraph: Number(slot.afterParagraph) || undefined,
      })
      newIndex += 1
    }
  })

  form.append('galleryOrder', JSON.stringify(galleryOrder))

  return form
}

export async function fetchArticlePosts() {
  const data = await apiFetch('/article', { skipAuth: true })
  return withResolvedImages(data.posts || [])
}

export async function fetchArticleBySlug(slug) {
  const data = await apiFetch(`/article/${encodeURIComponent(slug)}`, {
    skipAuth: true,
  })
  return {
    post: withResolvedImage(data.post),
    prev: withResolvedImage(data.prev),
    next: withResolvedImage(data.next),
    related: withResolvedImages(data.related || []),
  }
}

export async function createArticlePost(
  fields,
  imageFile,
  gallerySlots = [],
  options = {},
) {
  const data = await apiFetch('/article', {
    method: 'POST',
    body: buildArticleFormData(fields, imageFile, gallerySlots, options),
  })
  return withResolvedImage(data.post)
}

export async function updateArticlePost(
  id,
  fields,
  imageFile,
  gallerySlots = [],
  options = {},
) {
  const data = await apiFetch(`/article/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: buildArticleFormData(fields, imageFile, gallerySlots, options),
  })
  return withResolvedImage(data.post)
}

export async function deleteArticlePost(id) {
  return apiFetch(`/article/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export async function reorderArticlePosts(orderedIds) {
  const data = await apiFetch('/article/reorder', {
    method: 'PUT',
    body: JSON.stringify({ orderedIds }),
  })
  return withResolvedImages(data.posts || [])
}
