import { NavLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import LanguageToggle from '../../components/header/LanguageToggle'
import { selectLanguage } from '../../store/slices/languageSlice'
import { logoutUser } from '../../store/slices/authSlice'
import { LOGO_PATHS } from '../../data/menus'
import { FaSignOutAlt, getAdminNav } from '../nav'

function navClass(isActive) {
  return `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${
    isActive ? 'bg-[#e8a93a] text-[#1a1a1a] ring-2 ring-white/40' : 'text-white hover:bg-white/10'
  }`
}

export default function AdminSidebar() {
  const language = useSelector(selectLanguage)
  const dispatch = useDispatch()
  const items = getAdminNav(language)
  const logoSrc = language === 'en' ? LOGO_PATHS.en : LOGO_PATHS.kn
  const logoutLabel = language === 'kn' ? 'ಲಾಗ್ ಔಟ್' : 'Logout'

  return (
    <aside className="hidden h-full min-h-0 w-64 shrink-0 flex-col overflow-hidden bg-[#ac222b] sm:flex">
      <div className="flex items-center justify-between gap-2 border-b border-white/15 px-4 py-4">
        <img src={logoSrc} alt="Ciniyaana" className="h-10 w-auto max-w-[8rem] object-contain" />
        <LanguageToggle variant="mobile" />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin">
        {items.map(({ id, to, end, label, icon: Icon }) => (
          <NavLink key={id} to={to} end={end} className={({ isActive }) => `mb-1 ${navClass(isActive)}`}>
            <Icon className="shrink-0" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/15 px-3 py-3">
        <button
          type="button"
          onClick={() => dispatch(logoutUser())}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
        >
          <FaSignOutAlt />
          {logoutLabel}
        </button>
      </div>
    </aside>
  )
}
