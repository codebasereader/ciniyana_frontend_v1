/** Plain-text excerpt for meta descriptions — first paragraph, trimmed to length at a word boundary. */
export function toExcerpt(text, maxLength = 160) {
  if (!text) return ''
  const firstParagraph = text.split(/\n+/).find((line) => line.trim()) || ''
  const flat = firstParagraph.trim().replace(/\s+/g, ' ')
  if (flat.length <= maxLength) return flat
  const truncated = flat.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`
}
