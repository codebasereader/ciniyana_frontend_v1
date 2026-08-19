/**
 * Navigation menus sourced from englishmenu.md / kannadamenu.md
 * Each item: label (nav text) + slug for routing/anchors
 */

export const ENGLISH_MENU = [
  { id: 'flash-back', label: 'FLASH BACK', slug: 'flash-back' },
  { id: 'remembrance', label: 'REMEMBRANCE', slug: 'remembrance' },
  { id: 'info-special', label: 'INFO SPECIAL', slug: 'info-special' },
  { id: 'video', label: 'VIDEO', slug: 'video' },
  { id: 'poster', label: 'POSTER INFO', slug: 'poster' },
  { id: 'photo-story', label: 'PHOTO-STORY', slug: 'photo-story' },
  { id: 'off-the-camera', label: 'OFF THE CAMERA', slug: 'off-the-camera' },
  { id: 'article', label: 'ARTICLE', slug: 'article' },
  { id: 'film-today', label: 'FILM TODAY', slug: 'film-today' },
]

export const KANNADA_MENU = [
  { id: 'flash-back', label: 'ಫ್ಲಾಷ್‌ಬ್ಯಾಕ್‌', slug: 'flash-back' },
  { id: 'remembrance', label: 'ನೆನಪು', slug: 'remembrance' },
  { id: 'info-special', label: 'ಮಾಹಿತಿ ವಿಶೇಷ', slug: 'info-special' },
  { id: 'video', label: 'ವೀಡಿಯೋ', slug: 'video' },
  { id: 'poster', label: 'ಪೋಸ್ಟರ್ ಮಾಹಿತಿ', slug: 'poster' },
  { id: 'photo-story', label: 'ಚಿತ್ರ-ಕಥೆ', slug: 'photo-story' },
  { id: 'off-the-camera', label: 'ಆಫ್‌ ದಿ ಕ್ಯಾಮೆರಾ', slug: 'off-the-camera' },
  { id: 'article', label: 'ಬರಹ', slug: 'article' },
  { id: 'film-today', label: 'ಸಿನಿಮಾ ಇಂದು', slug: 'film-today' },
]

export const TAGLINE = {
  kn: 'ಚಲನಚಿತ್ರ ಅಂದು - ಇಂದು',
  en: 'Cinema: Then & Now',
}

export const LOGO_PATHS = {
  kn: '/logo/logo_kn.png',
  en: '/logo/logo_en.png',
  academy: '/logo/academylogo_new.png',
  state: '/logo/stategovtlogo.png',
}

export function getMenuByLanguage(language) {
  return language === 'en' ? ENGLISH_MENU : KANNADA_MENU
}
