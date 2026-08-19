import { FaHome, FaSearch } from 'react-icons/fa'
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getMenuByLanguage } from '../../data/menus'
import { selectLanguage } from '../../store/slices/languageSlice'

/**
 * Desktop / tablet primary navigation row — left-aligned with the Ciniyaana title.
 */
export default function NavMenu({ onNavigate, onSearchOpen }) {
  const language = useSelector(selectLanguage)
  const items = getMenuByLanguage(language)
  const aboutLabel = language === 'kn' ? 'ನಮ್ಮ ಬಗ್ಗೆ' : 'ABOUT US'

  const linkClass = ({ isActive }) =>
    `whitespace-nowrap text-[13px] font-bold tracking-wide transition sm:text-sm md:text-[15px] lg:text-base ${
      isActive
        ? 'text-white underline decoration-2 underline-offset-4'
        : 'text-[#EBC999] hover:text-white'
    }`

  return (
    <nav
      className="mt-1.5 -ml-1 flex w-full items-center justify-start gap-1 overflow-x-auto py-1 scrollbar-none sm:mt-2 sm:-ml-3 sm:gap-1.5 md:-ml-4 md:gap-2 lg:-ml-5"
      aria-label="Primary"
    >
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition sm:h-8 sm:w-8 ${
            isActive
              ? 'bg-[#f0b84a] ring-2 ring-inset ring-white/70'
              : 'bg-[#e8a93a] hover:bg-[#f0b84a]'
          }`
        }
        aria-label="Home"
        onClick={onNavigate}
      >
        <FaHome className="text-sm sm:text-base" />
      </NavLink>

      <ul className="flex shrink-0 items-center justify-start gap-x-2.5 gap-y-1 sm:gap-x-3 md:gap-x-3.5 lg:gap-x-4">
        {items.map((item) => (
          <li key={item.id} className="shrink-0">
            <NavLink
              to={`/${item.slug}`}
              className={linkClass}
              style={{ textTransform: language === 'kn' ? 'none' : 'uppercase' }}
              onClick={onNavigate}
            >
              {item.label}
            </NavLink>
          </li>
        ))}

        <li className="shrink-0">
          <NavLink
            to="/about-us"
            className={linkClass}
            style={{ textTransform: language === 'kn' ? 'none' : 'uppercase' }}
            onClick={onNavigate}
          >
            {aboutLabel}
          </NavLink>
        </li>

        <li className="shrink-0">
          <button
            type="button"
            className="flex items-center justify-center text-[#EBC999] transition hover:text-white"
            aria-label={language === 'kn' ? 'ಹುಡುಕಿ' : 'Search'}
            onClick={onSearchOpen}
          >
            <FaSearch className="text-sm sm:text-[15px] md:text-base" />
          </button>
        </li>
      </ul>
    </nav>
  )
}
