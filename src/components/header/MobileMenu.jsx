import {
  FaHome,
  FaBars,
  FaTimes,
  FaVideo,
  FaUser,
  FaSearch,
} from 'react-icons/fa'
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getMenuByLanguage } from '../../data/menus'
import { selectLanguage } from '../../store/slices/languageSlice'
import LanguageToggle from './LanguageToggle'

/**
 * Mobile hamburger button + slide-out drawer.
 */
export default function MobileMenu({ open, onClose, onOpen }) {
  const language = useSelector(selectLanguage)
  const items = getMenuByLanguage(language)

  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c4782a] text-white shadow-md"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <FaBars className="text-base" />
      </button>

      <div
        className={`fixed inset-0 z-50 sm:hidden ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!open}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-black/50 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
          aria-label="Close menu overlay"
          onClick={onClose}
        />

        <aside
          className={`absolute right-0 top-0 flex h-full w-[min(86vw,320px)] flex-col bg-[#ac222b] shadow-2xl transition-transform duration-300 ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="flex items-center justify-between border-b border-white/15 px-4 py-3">
            <LanguageToggle variant="mobile" />
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
              aria-label="Close menu"
            >
              <FaTimes />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Mobile primary">
            <NavLink
              to="/"
              end
              onClick={onClose}
              className={({ isActive }) =>
                `mb-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-white ${
                  isActive
                    ? 'bg-[#e8a93a] ring-2 ring-white/40'
                    : 'bg-[#c4782a]'
                }`
              }
            >
              <FaHome />
              {language === 'kn' ? 'ಹೋಂ' : 'Home'}
            </NavLink>

            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.id}>
                  <NavLink
                    to={`/${item.slug}`}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? 'bg-white/15 font-semibold text-white'
                          : 'text-[#EBC999] hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li>
                <NavLink
                  to="/about-us"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? 'bg-white/15 font-semibold text-white'
                        : 'text-[#EBC999] hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  {language === 'kn' ? 'ನಮ್ಮ ಬಗ್ಗೆ' : 'About Us'}
                </NavLink>
              </li>
            </ul>
          </nav>
        </aside>
      </div>
    </>
  )
}

/** Fixed bottom quick links for phones (matches mobile reference). */
export function MobileBottomBar({ onSearchOpen }) {
  const language = useSelector(selectLanguage)
  const searchLabel = language === 'kn' ? 'ಹುಡುಕಿ' : 'Search'

  const links = [
    {
      to: '/',
      end: true,
      icon: FaHome,
      label: language === 'kn' ? 'ಹೋಂ' : 'Home',
    },
    {
      to: '/video',
      icon: FaVideo,
      label: language === 'kn' ? 'ವಿಡಿಯೋ' : 'Video',
    },
    {
      to: '/about-us',
      icon: FaUser,
      label: language === 'kn' ? 'ನಮ್ಮ ಬಗ್ಗೆ' : 'About Us',
    },
  ]

  const itemClass = (isActive) =>
    `flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1 ${
      isActive ? 'text-[#ac222b]' : 'text-[#555]'
    }`

  const iconWrapClass = (isActive) =>
    `flex h-9 w-9 items-center justify-center rounded-full border-2 ${
      isActive
        ? 'border-[#ac222b] bg-[#ac222b] text-white'
        : 'border-[#c4782a] bg-[#e8e8e8] text-[#c4782a]'
    }`

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-[#d0d0d0] bg-[#e8e8e8] px-1 py-1.5 sm:hidden"
      aria-label="Mobile quick links"
    >
      {links.map(({ to, end, icon: Icon, label }) => (
        <NavLink
          key={label}
          to={to}
          end={end}
          className={({ isActive }) => itemClass(isActive)}
        >
          {({ isActive }) => (
            <>
              <span className={iconWrapClass(isActive)}>
                <Icon className="text-sm" />
              </span>
              <span className="truncate text-[10px] font-medium leading-tight">
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}

      <button
        type="button"
        onClick={onSearchOpen}
        className={itemClass(false)}
      >
        <span className={iconWrapClass(false)}>
          <FaSearch className="text-sm" />
        </span>
        <span className="truncate text-[10px] font-medium leading-tight">
          {searchLabel}
        </span>
      </button>
    </nav>
  )
}
