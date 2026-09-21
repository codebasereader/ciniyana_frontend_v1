import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUser } from '../../store/slices/authSlice'
import useSessionExpiry from '../hooks/useSessionExpiry'

export function ProtectedRoute() {
  useSessionExpiry()
  const user = useSelector(selectUser)

  // The session cookies are httpOnly — we can't read them from JS to check
  // validity synchronously. `user` (restored from localStorage) is an
  // optimistic "was logged in" hint; useSessionExpiry validates it for real
  // via a refresh attempt on mount and logs out (redirecting here) if that
  // fails, e.g. the refresh token expired while the tab was closed.
  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}

export function GuestRoute() {
  const user = useSelector(selectUser)

  if (user) {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}
