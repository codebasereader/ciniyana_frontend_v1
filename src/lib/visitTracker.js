import { API_BASE_URL } from '../../config.js'

const SESSION_KEY = 'ciniyana_visit_tracked'

/**
 * Records one visit for today, at most once per browser tab session.
 * Fire-and-forget — a network or storage failure here must never affect
 * the public site's UX, so every failure path is swallowed silently.
 */
export function trackVisitOnce() {
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {
    return
  }

  fetch(`${API_BASE_URL}/visits/track`, { method: 'POST' }).catch(() => {})
}
