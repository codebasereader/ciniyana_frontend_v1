import { apiFetch } from './client'

export function login({ email, password }) {
  return apiFetch('/user/login', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ email, password }),
  })
}

/**
 * Creates a new admin account. Open (no auth) only when no admin exists yet;
 * once one exists the backend requires the caller to already be a logged-in
 * admin — their session cookie is sent automatically by the browser either
 * way, so `skipAuth` here just means "don't try to refresh/retry on 401"
 * (a 401 means "not the first admin and not logged in", not "session died").
 */
export function register({ name, email, password }) {
  return apiFetch('/user/register', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ name, email, password }),
  })
}
