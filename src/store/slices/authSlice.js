import { createSlice } from '@reduxjs/toolkit'
import { API_BASE_URL } from '../../../config.js'

const KEYS = {
  user: 'user',
  accessTokenExpiresAt: 'accessTokenExpiresAt',
}

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.user) || 'null')
  } catch {
    return null
  }
}

function readStoredExpiry() {
  const raw = localStorage.getItem(KEYS.accessTokenExpiresAt)
  const parsed = raw ? Number(raw) : null
  return Number.isFinite(parsed) ? parsed : null
}

export function clearAuthStorage() {
  localStorage.removeItem(KEYS.user)
  localStorage.removeItem(KEYS.accessTokenExpiresAt)
}

function persistSession({ user, accessTokenExpiresAt }) {
  localStorage.setItem(KEYS.user, JSON.stringify(user))
  if (accessTokenExpiresAt != null) {
    localStorage.setItem(KEYS.accessTokenExpiresAt, String(accessTokenExpiresAt))
  }
}

// Neither token is stored here — they live in httpOnly cookies set by the
// server. `user` + `accessTokenExpiresAt` are just non-sensitive UI hints:
// "was logged in last time" and "when to next refresh".
const initialState = {
  user: readStoredUser(),
  accessTokenExpiresAt: readStoredExpiry(),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action) {
      const { user, accessTokenExpiresAt } = action.payload
      state.user = user
      state.accessTokenExpiresAt = accessTokenExpiresAt ?? null
      persistSession({ user, accessTokenExpiresAt })
    },
    sessionRefreshed(state, action) {
      const { accessTokenExpiresAt } = action.payload
      state.accessTokenExpiresAt = accessTokenExpiresAt ?? null
      if (accessTokenExpiresAt != null) {
        localStorage.setItem(KEYS.accessTokenExpiresAt, String(accessTokenExpiresAt))
      }
    },
    logout(state) {
      state.user = null
      state.accessTokenExpiresAt = null
      clearAuthStorage()
    },
  },
})

export const { loginSuccess, sessionRefreshed, logout } = authSlice.actions

/**
 * The real sign-out. The auth cookies are httpOnly, so only the server can
 * clear them — call sites must dispatch this (not the plain `logout` action
 * alone) or the browser keeps a live session cookie after the UI "logs out".
 */
export function logoutUser() {
  return async (dispatch) => {
    try {
      await fetch(`${API_BASE_URL}/user/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // Best-effort — cookies still expire on their own via maxAge.
    }
    dispatch(logout())
  }
}

export const selectAuth = (state) => state.auth
export const selectUser = (state) => state.auth.user
export const selectAccessTokenExpiresAt = (state) => state.auth.accessTokenExpiresAt
export default authSlice.reducer
