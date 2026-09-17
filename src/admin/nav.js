import {
  FaHome,
  FaHistory,
  FaHeart,
  FaInfoCircle,
  FaVideo,
  FaImage,
  FaCamera,
  FaFilm,
  FaNewspaper,
  FaPlayCircle,
  FaEllipsisH,
  FaSignOutAlt,
} from 'react-icons/fa'
import { ENGLISH_MENU, KANNADA_MENU } from '../data/menus'

const MENU_ICONS = {
  'flash-back': FaHistory,
  remembrance: FaHeart,
  'info-special': FaInfoCircle,
  video: FaVideo,
  poster: FaImage,
  'photo-story': FaCamera,
  'off-the-camera': FaFilm,
  article: FaNewspaper,
  'film-today': FaPlayCircle,
}

export const ADMIN_MENU_IDS = ENGLISH_MENU.map((item) => item.id)

export const MOBILE_PRIMARY_IDS = ['dashboard', 'flash-back', 'remembrance']

export { FaEllipsisH, FaSignOutAlt }

export function getAdminNav(language) {
  const menus = language === 'en' ? ENGLISH_MENU : KANNADA_MENU
  const dashboardLabel = language === 'kn' ? 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' : 'Dashboard'

  return [
    {
      id: 'dashboard',
      to: '/admin',
      end: true,
      label: dashboardLabel,
      icon: FaHome,
    },
    ...menus.map((item) => ({
      id: item.id,
      to: `/admin/${item.id}`,
      end: false,
      label: item.label,
      icon: MENU_ICONS[item.id] ?? FaNewspaper,
    })),
  ]
}

export function getMobilePrimaryNav(language) {
  return getAdminNav(language).filter((item) => MOBILE_PRIMARY_IDS.includes(item.id))
}

export function getMobileMoreNav(language) {
  return getAdminNav(language).filter((item) => !MOBILE_PRIMARY_IDS.includes(item.id))
}

export function isAdminMenuId(menuId) {
  return ADMIN_MENU_IDS.includes(menuId)
}
