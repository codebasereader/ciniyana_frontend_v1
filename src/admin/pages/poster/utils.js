/**
 * Poster helpers — form mapping and validation.
 * Admin fields are only: image + titleEn + titleKn.
 */

export function postToFormFields(post) {
  if (!post) {
    return {
      slug: '',
      titleEn: '',
      titleKn: '',
    }
  }

  return {
    slug: post.slug || '',
    titleEn: post.title?.en || '',
    titleKn: post.title?.kn || '',
  }
}

export function validatePosterFields(fields, { requireImage, hasExistingImage }) {
  const errors = {}

  if (!fields.titleEn?.trim()) errors.titleEn = 'English title is required'
  if (!fields.titleKn?.trim()) errors.titleKn = 'Kannada title is required'

  if (requireImage && !hasExistingImage) {
    errors.image = 'Poster image is required'
  }

  return errors
}
