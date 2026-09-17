import { isValidYouTubeUrl } from '../../../lib/youtube'

/**
 * Video helpers — slug, form mapping, validation.
 */

export function slugify(text = '') {
  return String(text)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function postToFormFields(post) {
  if (!post) {
    return {
      slug: '',
      youtubeUrl: '',
      titleEn: '',
      titleKn: '',
      categoryEn: '',
      categoryKn: '',
      bodyEn: '',
      bodyKn: '',
      date: '',
    }
  }

  return {
    slug: post.slug || '',
    youtubeUrl: post.youtubeUrl || '',
    titleEn: post.title?.en || '',
    titleKn: post.title?.kn || '',
    categoryEn: post.category?.en || '',
    categoryKn: post.category?.kn || '',
    bodyEn: post.body?.en || '',
    bodyKn: post.body?.kn || '',
    date: post.date || '',
  }
}

export function validateVideoFields(fields) {
  const errors = {}

  if (!fields.titleEn?.trim()) errors.titleEn = 'English title is required'
  if (!fields.titleKn?.trim()) errors.titleKn = 'Kannada title is required'

  if (!fields.youtubeUrl?.trim()) {
    errors.youtubeUrl = 'YouTube URL is required'
  } else if (!isValidYouTubeUrl(fields.youtubeUrl)) {
    errors.youtubeUrl = 'Paste a valid YouTube video URL'
  }

  if (fields.slug?.trim() && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.slug.trim())) {
    errors.slug = 'Use lowercase letters, numbers, and hyphens only'
  }

  return errors
}
