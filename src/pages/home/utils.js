/** First N chars of body as a short teaser (preserves word boundary). */
export function excerpt(text = '', max = 140) {
  const clean = String(text).replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max).replace(/\s+\S*$/, '')}…`
}

export function pickLang(field, language) {
  if (!field) return ''
  if (typeof field === 'string') return field
  return language === 'en' ? field.en : field.kn
}
