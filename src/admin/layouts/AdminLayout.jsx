import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import AdminSidebar from './AdminSidebar'
import AdminBottomNav from './AdminBottomNav'
import MoreDialog from './MoreDialog'
import LanguageToggle from '../../components/header/LanguageToggle'
import { setLanguage } from '../../store/slices/languageSlice'

export default function AdminLayout() {
  const dispatch = useDispatch()
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    dispatch(setLanguage('en'))
  }, [dispatch])

  // Prevent document + panel both scrolling (double scrollbar)
  useEffect(() => {
    const html = document.documentElement
    const { body } = document
    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    return () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
    }
  }, [])

  return (
    <div className="flex h-dvh max-h-dvh overflow-hidden bg-[#f6f1ea]">
      <AdminSidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-end border-b border-[#ead9c4] bg-white px-4 py-2 sm:hidden">
          <LanguageToggle variant="mobile" />
        </div>
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-8 sm:py-8">
          <Outlet />
          {/* Mobile bottom-nav clearance inside the scrolling pane only */}
          <div className="h-16 sm:hidden" aria-hidden="true" />
        </main>
      </div>

      <AdminBottomNav moreOpen={moreOpen} onMoreOpen={() => setMoreOpen(true)} />
      <MoreDialog open={moreOpen} onClose={() => setMoreOpen(false)} />
    </div>
  )
}
