import { NavLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { selectLanguage } from '../../store/slices/languageSlice'
import { logoutUser } from '../../store/slices/authSlice'
import { FaSignOutAlt, getMobileMoreNav } from '../nav'

export default function MoreDialog({ open, onClose }) {
  const language = useSelector(selectLanguage)
  const dispatch = useDispatch()
  const items = getMobileMoreNav(language)
  const moreTitle = language === 'kn' ? 'ಇನ್ನಷ್ಟು' : 'More'
  const logoutLabel = language === 'kn' ? 'ಲಾಗ್ ಔಟ್' : 'Logout'

  return (
    <div
      className={`fixed inset-0 z-50 sm:hidden ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-black/50 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        aria-label="Close more menu"
        onClick={onClose}
      />

      <div
        className={`absolute inset-x-0 bottom-0 rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={moreTitle}
      >
        <div className="flex items-center justify-between border-b border-[#eee] px-4 py-3">
          <h2 className="text-base font-bold text-[#ac222b]">{moreTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm font-semibold text-[#555]"
          >
            {language === 'kn' ? 'ಮುಚ್ಚಿ' : 'Close'}
          </button>
        </div>

        <nav className="max-h-[60vh] overflow-y-auto px-2 py-2">
          {items.map(({ id, to, label, icon: Icon }) => (
            <NavLink
              key={id}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `mb-1 flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold ${
                  isActive ? 'bg-[#ac222b] text-white' : 'text-[#333] hover:bg-[#f6f1ea]'
                }`
              }
            >
              <Icon />
              {label}
            </NavLink>
          ))}

          <button
            type="button"
            onClick={() => {
              onClose()
              dispatch(logoutUser())
            }}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-[#ac222b]"
          >
            <FaSignOutAlt />
            {logoutLabel}
          </button>
        </nav>
      </div>
    </div>
  )
}
