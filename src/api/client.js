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
  const { logout } = await import('../store/slices/authSlice')
  store.dispatch(logout())
}

export async function apiFetch(path, options = {}) {
  const { skipAuth = false, headers: extraHeaders, ...rest } = options
  const accessToken = localStorage.getItem('accessToken')
  const isFormData = typeof FormData !== 'undefined' && rest.body instanceof FormData

  if (!skipAuth && accessToken && isAccessTokenExpired(accessToken)) {
    await forceLogout()
    throw new ApiError('Session expired', 401)
  }

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(accessToken && !skipAuth ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...extraHeaders,
  }

  // Let the browser set multipart boundary when uploading files
  if (isFormData && headers['Content-Type']) {
    delete headers['Content-Type']
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...rest, headers })
  const data = await res.json().catch(() => ({}))

  if (res.status === 401) {
    if (!skipAuth) {
      await forceLogout()
    }
    throw new ApiError(data.message || 'Unauthorized', 401)
  }

  if (!res.ok) {
    throw new ApiError(data.message || 'Request failed', res.status)
  }

  return data
}
