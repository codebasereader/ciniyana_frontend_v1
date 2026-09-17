/**
 * Client-side JWT helpers (expiry only — signature is verified by the API).
 */

function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length < 2) return null

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

/** @returns {number|null} expiry as epoch ms, or null if unknown */
export function getAccessTokenExpiryMs(token) {
  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return null
  return Number(payload.exp) * 1000
}

export function isAccessTokenExpired(token) {
  if (!token) return true
  const expiryMs = getAccessTokenExpiryMs(token)
  if (expiryMs == null) return false
  // Small skew so we logout slightly before the server rejects
  return Date.now() >= expiryMs - 5_000
}

/** ms until expiry (clamped ≥ 0), or null if unknown */
export function getMsUntilAccessTokenExpiry(token) {
  const expiryMs = getAccessTokenExpiryMs(token)
  if (expiryMs == null) return null
  return Math.max(0, expiryMs - 5_000 - Date.now())
}
