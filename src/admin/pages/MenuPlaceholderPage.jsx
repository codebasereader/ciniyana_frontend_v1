import { Navigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ENGLISH_MENU, KANNADA_MENU } from '../../data/menus'
import { isAdminMenuId } from '../nav'
import { selectLanguage } from '../../store/slices/languageSlice'

export default function MenuPlaceholderPage() {
  const { menuId } = useParams()
  const language = useSelector(selectLanguage)

  if (!isAdminMenuId(menuId)) {
    return <Navigate to="/admin" replace />
  }

  const menus = language === 'en' ? ENGLISH_MENU : KANNADA_MENU
  const item = menus.find((menu) => menu.id === menuId)
  const isKn = language === 'kn'

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-[#ac222b] sm:text-3xl">{item?.label}</h1>
      <p className="mt-4 rounded-xl border border-[#ead9c4] bg-[#fbf6ef] px-4 py-3 text-sm text-[#555]">
        {isKn
          ? 'ಈ ವಿಭಾಗದ CRUD ಶೀಘ್ರದಲ್ಲೇ ಬರುತ್ತದೆ.'
          : 'CRUD for this section is coming soon.'}
      </p>
    </div>
  )
}
