/**
 * Client-side mirror of the backend upload rules (middleware/upload.js), so
 * admins get an immediate message. The server re-checks everything — this is
 * only a UX layer, never the security boundary.
 */

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// Inner extensions that must not precede the real one (shell.php.jpg, a.jpg.png).
const BLOCKED_INNER_EXTENSIONS = new Set([
  '.php', '.php3', '.php4', '.php5', '.php7', '.phtml', '.phar', '.pht',
  '.asp', '.aspx', '.jsp', '.jspx', '.cgi', '.pl', '.py', '.rb', '.sh', '.bash',
  '.exe', '.dll', '.bat', '.cmd', '.com', '.msi', '.js', '.mjs', '.html', '.htm',
  '.shtml', '.svg', '.xml', '.htaccess', '.jpg', '.jpeg', '.png', '.webp', '.gif',
])

/** @returns {string|null} an error message, or null when the file looks fine */
export function validateImageFile(file) {
  if (!file) return null
  const name = String(file.name || '')
  const dot = name.lastIndexOf('.')
  const ext = dot >= 0 ? name.slice(dot).toLowerCase() : ''

  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIMES.includes(file.type)) {
    return `"${name}" is not allowed. Use a JPG, PNG, WebP or GIF image.`
  }

  const stem = name.slice(0, dot)
  const inner = stem.match(/\.[A-Za-z0-9]{1,8}(?=\.|$)/g) || []
  if (inner.some((part) => BLOCKED_INNER_EXTENSIONS.has(part.toLowerCase()))) {
    return `"${name}" has more than one file extension. Rename it (e.g. photo.jpg) and try again.`
  }
  return null
}

const MAX_DIMENSION = 1920
const WEBP_QUALITY = 0.82

/**
 * Re-encodes an image as WebP in the browser before upload (resized so the
 * longest side is at most 1920px). Falls back to the original file if the
 * browser can't decode/encode it, if it's an animated-capable GIF, or if the
 * result would be larger than what the admin picked.
 *
 * @param {File} file
 * @returns {Promise<File>}
 */
export async function compressToWebp(file) {
  if (!file || file.type === 'image/gif') return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height)
    bitmap.close?.()

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY),
    )
    if (!blob || blob.type !== 'image/webp') return file
    if (file.type === 'image/webp' && blob.size >= file.size && scale === 1) return file

    const stem = String(file.name || 'image').replace(/\.[^.]*$/, '') || 'image'
    return new File([blob], `${stem}.webp`, { type: 'image/webp', lastModified: Date.now() })
  } catch {
    return file
  }
}
