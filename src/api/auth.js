import { apiFetch } from './client'

export function login({ email, password }) {
  return apiFetch('/user/login', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ email, password }),
  })
}

export function register({ name, email, password, role = 'admin' }) {
  return apiFetch('/user/register', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ name, email, password, role }),
  })
}
