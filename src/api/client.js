import { API_BASE_URL } from '../../config.js'
import { isAccessTokenExpired } from './token.js'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
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
      if (!res.ok) throw new ApiError(data.message || 'Session expired', res.status)

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
    } catch {
      await forceLogout()
      throw new ApiError('Session expired', 401)
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
    try {
      await refreshAccessToken()
    } catch {
      await forceLogout()
      throw new ApiError(data.message || 'Unauthorized', 401)
    }
    res = await doFetch()
    data = await res.json().catch(() => ({}))
  }

  if (res.status === 401) {
    if (!skipAuth) await forceLogout()
    throw new ApiError(data.message || 'Unauthorized', 401)
  }

  if (!res.ok) {
    throw new ApiError(data.message || 'Request failed', res.status)
  }

  return data
}
