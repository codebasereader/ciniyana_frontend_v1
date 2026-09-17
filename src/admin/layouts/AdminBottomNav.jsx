import { NavLink, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectLanguage } from '../../store/slices/languageSlice'
import { FaEllipsisH, getMobileMoreNav, getMobilePrimaryNav } from '../nav'

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

export default function AdminBottomNav({ moreOpen, onMoreOpen }) {
  const language = useSelector(selectLanguage)
  const location = useLocation()
  const primary = getMobilePrimaryNav(language)
  const moreItems = getMobileMoreNav(language)
  const moreActive = moreItems.some((item) => location.pathname === item.to)
  const moreLabel = language === 'kn' ? 'ಇನ್ನಷ್ಟು' : 'More'

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-[#d0d0d0] bg-[#e8e8e8] px-1 py-1.5 sm:hidden"
      aria-label="Admin mobile"
    >
      {primary.map(({ id, to, end, label, icon: Icon }) => (
        <NavLink key={id} to={to} end={end} className={({ isActive }) => itemClass(isActive)}>
          {({ isActive }) => (
            <>
              <span className={iconWrapClass(isActive)}>
                <Icon className="text-sm" />
              </span>
              <span className="truncate text-[10px] font-medium leading-tight">{label}</span>
            </>
          )}
        </NavLink>
      ))}

      <button type="button" onClick={onMoreOpen} className={itemClass(moreOpen || moreActive)}>
        <span className={iconWrapClass(moreOpen || moreActive)}>
          <FaEllipsisH className="text-sm" />
        </span>
        <span className="truncate text-[10px] font-medium leading-tight">{moreLabel}</span>
      </button>
    </nav>
  )
}
