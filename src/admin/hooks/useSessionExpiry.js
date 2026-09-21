import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { refreshAccessToken } from '../../api/client'
import {
  getMsUntilAccessTokenExpiry,
  isAccessTokenExpired,
} from '../../api/token'
import { logoutUser, selectAccessTokenExpiresAt, selectUser } from '../../store/slices/authSlice'

/**
 * Keeps the session alive by silently refreshing the (httpOnly, cookie-held)
 * access token when it expires (timer + tab focus/visibility checks). Only
 * logs out when the refresh itself fails, i.e. the refresh token is also
 * expired/revoked. A successful refresh updates `accessTokenExpiresAt` in
 * the store, which re-runs this effect and schedules the next refresh.
 */
export default function useSessionExpiry() {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const accessTokenExpiresAt = useSelector(selectAccessTokenExpiresAt)

  useEffect(() => {
    if (!user) return undefined
    let cancelled = false

    const ensureFresh = async () => {
      if (!isAccessTokenExpired(accessTokenExpiresAt)) return
      try {
        await refreshAccessToken()
      } catch {
        if (!cancelled) dispatch(logoutUser())
      }
    }

    ensureFresh()

    const ms = getMsUntilAccessTokenExpiry(accessTokenExpiresAt)
    // Unknown expiry (e.g. just restored from localStorage) — check again shortly.
    const timerId = window.setTimeout(ensureFresh, ms ?? 30_000)

    window.addEventListener('focus', ensureFresh)
    document.addEventListener('visibilitychange', ensureFresh)

    return () => {
      cancelled = true
      window.clearTimeout(timerId)
      window.removeEventListener('focus', ensureFresh)
      document.removeEventListener('visibilitychange', ensureFresh)
    }
  }, [user, accessTokenExpiresAt, dispatch])
}
