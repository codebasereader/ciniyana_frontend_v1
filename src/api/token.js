/**
 * Session-expiry helpers.
 *
 * The access/refresh tokens live in httpOnly cookies the browser attaches
 * automatically — client JS never sees the raw JWTs. The server hands back
 * the access token's expiry as a plain epoch-ms timestamp instead, and
 * these helpers operate on that number.
 */

const SKEW_MS = 5_000

/** @param {number|null|undefined} expiresAtMs */
export function isAccessTokenExpired(expiresAtMs) {
  if (expiresAtMs == null) return true
  // Small skew so we refresh slightly before the server would reject.
  return Date.now() >= expiresAtMs - SKEW_MS
}

/** @param {number|null|undefined} expiresAtMs @returns {number|null} ms until expiry (clamped ≥ 0), or null if unknown */
export function getMsUntilAccessTokenExpiry(expiresAtMs) {
  if (expiresAtMs == null) return null
  return Math.max(0, expiresAtMs - SKEW_MS - Date.now())
}
