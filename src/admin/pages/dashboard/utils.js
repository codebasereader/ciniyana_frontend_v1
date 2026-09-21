const UNITS = [
  { label: 'year', secs: 31536000 },
  { label: 'month', secs: 2592000 },
  { label: 'day', secs: 86400 },
  { label: 'hour', secs: 3600 },
  { label: 'minute', secs: 60 },
]

export function timeAgo(dateInput) {
  if (!dateInput) return 'Never'

  const seconds = Math.floor((Date.now() - new Date(dateInput).getTime()) / 1000)

  for (const { label, secs } of UNITS) {
    const value = Math.floor(seconds / secs)
    if (value >= 1) return `${value} ${label}${value > 1 ? 's' : ''} ago`
  }

  return 'Just now'
}
