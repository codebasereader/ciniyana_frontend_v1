import { apiFetch } from './client'

export function fetchPostStats() {
  return apiFetch('/stats/posts')
}

export function fetchVisitStats() {
  return apiFetch('/visits/stats')
}
