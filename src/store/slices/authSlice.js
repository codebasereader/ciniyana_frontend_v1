import { createSlice } from '@reduxjs/toolkit'
import { isAccessTokenExpired } from '../../api/token'

const KEYS = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  user: 'user',
}

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.user) || 'null')
  } catch {
    return null
  }
}

function persistSession({ accessToken, refreshToken, user }) {
  localStorage.setItem(KEYS.accessToken, accessToken)
  localStorage.setItem(KEYS.refreshToken, refreshToken)
  localStorage.setItem(KEYS.user, JSON.stringify(user))
}

export function clearAuthStorage() {
  localStorage.removeItem(KEYS.accessToken)
  localStorage.removeItem(KEYS.refreshToken)
  localStorage.removeItem(KEYS.user)
}

function readInitialSession() {
  const accessToken = localStorage.getItem(KEYS.accessToken)
  const refreshToken = localStorage.getItem(KEYS.refreshToken)
  const user = readStoredUser()

  if (!accessToken || isAccessTokenExpired(accessToken)) {
    clearAuthStorage()
    return { accessToken: null, refreshToken: null, user: null }
  }

  return { accessToken, refreshToken, user }
}

const initialState = readInitialSession()

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action) {
      const { accessToken, refreshToken, user } = action.payload
      state.accessToken = accessToken
      state.refreshToken = refreshToken
      state.user = user
      persistSession({ accessToken, refreshToken, user })
    },
    logout(state) {
      state.accessToken = null
      state.refreshToken = null
      state.user = null
      clearAuthStorage()
    },
  },
})

export const { loginSuccess, logout } = authSlice.actions
export const selectAuth = (state) => state.auth
export const selectAccessToken = (state) => state.auth.accessToken
export const selectUser = (state) => state.auth.user
export default authSlice.reducer
