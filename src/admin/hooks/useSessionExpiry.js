import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getMsUntilAccessTokenExpiry,
  isAccessTokenExpired,
} from '../../api/token'
import { logout, selectAccessToken } from '../../store/slices/authSlice'

/**
 * Logs out when the access JWT expires (timer + tab focus / visibility checks).
 * API 401 responses still clear the session via apiFetch.
 */
export default function useSessionExpiry() {
  const dispatch = useDispatch()
  const accessToken = useSelector(selectAccessToken)

  useEffect(() => {
    if (!accessToken) return undefined

    const expireNow = () => {
      if (isAccessTokenExpired(accessToken) || isAccessTokenExpired(localStorage.getItem('accessToken'))) {
        dispatch(logout())
      }
    }

    expireNow()

    const ms = getMsUntilAccessTokenExpiry(accessToken)
    let timerId
    if (ms != null) {
      timerId = window.setTimeout(() => {
        dispatch(logout())
      }, ms)
    }

    const onFocusOrVisible = () => {
      expireNow()
    }

    window.addEventListener('focus', onFocusOrVisible)
    document.addEventListener('visibilitychange', onFocusOrVisible)

    return () => {
      if (timerId != null) window.clearTimeout(timerId)
      window.removeEventListener('focus', onFocusOrVisible)
      document.removeEventListener('visibilitychange', onFocusOrVisible)
    }
  }, [accessToken, dispatch])
}
