import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { API_BASE_URL } from './config.js'

// Fills the CSP placeholder in index.html with the API origin from config.js,
// so the policy always matches whatever API the app is pointed at.
function apiOriginCsp() {
  const origin = new URL(API_BASE_URL).origin
  return {
    name: 'api-origin-csp',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replaceAll('%VITE_API_BASE_URL%', origin),
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiOriginCsp()],
})
