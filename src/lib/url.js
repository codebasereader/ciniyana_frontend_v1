import { SITE_URL } from '../constants/site'

/** Open Graph/Twitter images must be absolute — prefix site-relative paths. */
export function toAbsoluteUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`
}
