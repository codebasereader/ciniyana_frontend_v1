/**
 * Article helpers — slug, form mapping, validation.
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
      subtitleEn: '',
      subtitleKn: '',
      bodyEn: '',
      bodyKn: '',
      categoryEn: 'Kannada Cinema',
      categoryKn: 'ಕನ್ನಡ ಸಿನಿಮಾ',
      photoCreditEn: '',
      photoCreditKn: '',
      courtesyEn: '',
      courtesyKn: '',
      layout: 'landscape',
      galleryMode: 'interleave',
      profileNameEn: '',
      profileNameKn: '',
      profileRoleEn: '',
      profileRoleKn: '',
      profileIntroEn: '',
      profileIntroKn: '',
    }
  }

  return {
    slug: post.slug || '',
    date: post.date || '',
    titleEn: post.title?.en || '',
    titleKn: post.title?.kn || '',
    subtitleEn: post.subtitle?.en || '',
    subtitleKn: post.subtitle?.kn || '',
    bodyEn: post.body?.en || '',
    bodyKn: post.body?.kn || '',
    categoryEn: post.category?.en || '',
    categoryKn: post.category?.kn || '',
    photoCreditEn: post.photoCredit?.en || '',
    photoCreditKn: post.photoCredit?.kn || '',
    courtesyEn: post.courtesy?.en || '',
    courtesyKn: post.courtesy?.kn || '',
    layout: post.layout || 'landscape',
    galleryMode: post.galleryMode || 'interleave',
    profileNameEn: post.profile?.name?.en || '',
    profileNameKn: post.profile?.name?.kn || '',
    profileRoleEn: post.profile?.role?.en || '',
    profileRoleKn: post.profile?.role?.kn || '',
    profileIntroEn: post.profile?.intro?.en || '',
    profileIntroKn: post.profile?.intro?.kn || '',
  }
}

export function splitBodyParagraphs(text = '') {
  return String(text)
    .split(/\n+/)
    .map((para) => para.trim())
    .filter(Boolean)
}

export function galleryFromPost(post) {
  return (post?.gallery || []).map((item, index) => ({
    key: `existing-${index}-${item.src}`,
    kind: 'existing',
    src: item.src,
    captionEn: item.caption?.en || '',
    captionKn: item.caption?.kn || '',
    afterParagraph: Number(item.afterParagraph) || null,
    file: null,
    previewUrl: item.src,
  }))
}

export function validateArticleFields(fields, { requireImage, hasExistingImage }) {
  const errors = {}

  if (!fields.titleEn?.trim()) errors.titleEn = 'English title is required'
  if (!fields.titleKn?.trim()) errors.titleKn = 'Kannada title is required'
  if (!fields.subtitleEn?.trim()) errors.subtitleEn = 'English subtitle is required'
  if (!fields.subtitleKn?.trim()) errors.subtitleKn = 'Kannada subtitle is required'
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
