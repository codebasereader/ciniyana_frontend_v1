/**
 * Shared Flash Back helpers (slug, form mapping).
 */

export function slugify(text = '') {
  return String(text)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function postToFormFields(post) {
  if (!post) {
    return {
      slug: '',
      date: '',
      titleEn: '',
      titleKn: '',
      bodyEn: '',
      bodyKn: '',
      categoryEn: 'Kannada Cinema',
      categoryKn: 'ಕನ್ನಡ ಸಿನಿಮಾ',
      photoCreditEn: '',
      photoCreditKn: '',
    }
  }

  return {
    slug: post.slug || '',
    date: post.date || '',
    titleEn: post.title?.en || '',
    titleKn: post.title?.kn || '',
    bodyEn: post.body?.en || '',
    bodyKn: post.body?.kn || '',
    categoryEn: post.category?.en || '',
    categoryKn: post.category?.kn || '',
    photoCreditEn: post.photoCredit?.en || '',
    photoCreditKn: post.photoCredit?.kn || '',
  }
}

export function validateFlashBackFields(fields, { requireImage, hasExistingImage }) {
  const errors = {}

  if (!fields.titleEn?.trim()) errors.titleEn = 'English title is required'
  if (!fields.titleKn?.trim()) errors.titleKn = 'Kannada title is required'
  if (!fields.bodyEn?.trim()) errors.bodyEn = 'English body is required'
  if (!fields.bodyKn?.trim()) errors.bodyKn = 'Kannada body is required'
  if (!fields.slug?.trim()) errors.slug = 'Slug is required'
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.slug.trim())) {
    errors.slug = 'Use lowercase letters, numbers, and hyphens only'
  }

  if (requireImage && !hasExistingImage) {
    errors.image = 'Hero image is required'
  }

  return errors
}
