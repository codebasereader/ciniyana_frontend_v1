import { API_BASE_URL } from '../../config.js'
import { isAccessTokenExpired } from './token.js'

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export const AUTH_NOTICE_KEY = 'authNotice'

// The backend allows one active session per account; when a newer login
// replaces this one, tell the user why they landed on the login page.
function rememberSessionReplaced(code) {
  if (code !== 'SESSION_REPLACED') return
  try {
    sessionStorage.setItem(AUTH_NOTICE_KEY, 'SESSION_REPLACED')
  } catch {
    // Storage unavailable — the plain login page is still correct.
  }
}

async function forceLogout() {
  const { store } = await import('../store')
  const { logoutUser } = await import('../store/slices/authSlice')
  await store.dispatch(logoutUser())
}

async function persistRefreshedSession(accessTokenExpiresAt) {
  const { store } = await import('../store')
  const { sessionRefreshed } = await import('../store/slices/authSlice')
  store.dispatch(sessionRefreshed({ accessTokenExpiresAt }))
}

async function getKnownExpiry() {
  const { store } = await import('../store')
  const { selectAccessTokenExpiresAt } = await import('../store/slices/authSlice')
  return selectAccessTokenExpiresAt(store.getState())
}

let inFlightRefresh = null

/**
 * Rotates the (httpOnly, cookie-held) refresh token for a new pair.
 * Concurrent callers share one in-flight request so a burst of expired
 * requests doesn't fire the rotating refresh token multiple times.
 */
export function refreshAccessToken() {
  if (!inFlightRefresh) {
    inFlightRefresh = (async () => {
      const res = await fetch(`${API_BASE_URL}/user/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new ApiError(data.message || 'Session expired', res.status, data.code)

      await persistRefreshedSession(data.accessTokenExpiresAt ?? null)
      return data.accessTokenExpiresAt
    })().finally(() => {
      inFlightRefresh = null
    })
  }
  return inFlightRefresh
}

function buildHeaders({ isFormData, extraHeaders }) {
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...extraHeaders,
  }

  // Let the browser set multipart boundary when uploading files
  if (isFormData) delete headers['Content-Type']

  return headers
}

export async function apiFetch(path, options = {}) {
  const { skipAuth = false, headers: extraHeaders, ...rest } = options
  const isFormData = typeof FormData !== 'undefined' && rest.body instanceof FormData

  if (!skipAuth && isAccessTokenExpired(await getKnownExpiry())) {
    try {
      await refreshAccessToken()
    } catch (err) {
      rememberSessionReplaced(err?.code)
      await forceLogout()
      throw new ApiError('Session expired', 401, err?.code)
    }
  }

  const doFetch = () =>
    fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      // The session cookies are cross-origin (separate frontend/API ports
      // or domains) — the browser only attaches them when this is set.
      credentials: 'include',
      headers: buildHeaders({ isFormData, extraHeaders }),
    })

  let res = await doFetch()
  let data = await res.json().catch(() => ({}))

  // Server rejected the access token despite it looking valid client-side
  // (revoked, clock skew, etc). Refresh once and retry before giving up.
  if (res.status === 401 && !skipAuth) {
    const replacedCode = data.code
    try {
      await refreshAccessToken()
    } catch (err) {
      rememberSessionReplaced(replacedCode || err?.code)
      await forceLogout()
      throw new ApiError(data.message || 'Unauthorized', 401, replacedCode || err?.code)
    }
    res = await doFetch()
    data = await res.json().catch(() => ({}))
  }

  if (res.status === 401) {
    if (!skipAuth) {
      rememberSessionReplaced(data.code)
      await forceLogout()
    }
    throw new ApiError(data.message || 'Unauthorized', 401, data.code)
  }

  if (!res.ok) {
    throw new ApiError(data.message || 'Request failed', res.status, data.code)
  }

  return data
}
