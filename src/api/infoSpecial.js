import { apiFetch } from './client'
import { withResolvedImage, withResolvedImages } from './media'

/**
 * Build multipart body for info-special create/update.
 *
 * gallerySlots: ordered final gallery description
 *   - { kind: 'existing', src, captionEn, captionKn }
 *   - { kind: 'new', file, captionEn, captionKn }
 *
 * profileImageFile: optional File for contributor photo
 * clearProfileImage: when true on update, tell server to remove profile photo
 */
function buildInfoSpecialFormData(
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
    bodyEn,
    bodyKn,
    categoryEn = '',
    categoryKn = '',
    photoCreditEn = '',
    photoCreditKn = '',
    courtesyEn = '',
    courtesyKn = '',
    layout = 'landscape',
    galleryMode = 'carousel',
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

export async function fetchInfoSpecialPosts() {
  const data = await apiFetch('/info-special', { skipAuth: true })
  return withResolvedImages(data.posts || [])
}

export async function fetchInfoSpecialBySlug(slug) {
  const data = await apiFetch(`/info-special/${encodeURIComponent(slug)}`, {
    skipAuth: true,
  })
  return {
    post: withResolvedImage(data.post),
    prev: withResolvedImage(data.prev),
    next: withResolvedImage(data.next),
    related: withResolvedImages(data.related || []),
  }
}

export async function createInfoSpecialPost(
  fields,
  imageFile,
  gallerySlots = [],
  options = {},
) {
  const data = await apiFetch('/info-special', {
    method: 'POST',
    body: buildInfoSpecialFormData(fields, imageFile, gallerySlots, options),
  })
  return withResolvedImage(data.post)
}

export async function updateInfoSpecialPost(
  id,
  fields,
  imageFile,
  gallerySlots = [],
  options = {},
) {
  const data = await apiFetch(`/info-special/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: buildInfoSpecialFormData(fields, imageFile, gallerySlots, options),
  })
  return withResolvedImage(data.post)
}

export async function deleteInfoSpecialPost(id) {
  return apiFetch(`/info-special/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export async function reorderInfoSpecialPosts(orderedIds) {
  const data = await apiFetch('/info-special/reorder', {
    method: 'PUT',
    body: JSON.stringify({ orderedIds }),
  })
  return withResolvedImages(data.posts || [])
}
