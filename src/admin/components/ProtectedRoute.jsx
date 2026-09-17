import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout, selectAccessToken } from '../../store/slices/authSlice'
import { isAccessTokenExpired } from '../../api/token'
import useSessionExpiry from '../hooks/useSessionExpiry'

export function ProtectedRoute() {
  useSessionExpiry()
  const accessToken = useSelector(selectAccessToken)

  if (!accessToken || isAccessTokenExpired(accessToken)) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}

export function GuestRoute() {
  const dispatch = useDispatch()
  const accessToken = useSelector(selectAccessToken)

  useEffect(() => {
    if (accessToken && isAccessTokenExpired(accessToken)) {
      dispatch(logout())
    }
  }, [accessToken, dispatch])

  if (accessToken && !isAccessTokenExpired(accessToken)) {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}
