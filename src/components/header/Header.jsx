import { useState } from 'react'
import BrandLogo from './BrandLogo'
import HeaderStrip from './HeaderStrip'
import LanguageToggle from './LanguageToggle'
import MobileMenu, { MobileBottomBar } from './MobileMenu'
import NavMenu from './NavMenu'
import PartnerLogos, { AcademyLogo, StateLogo } from './PartnerLogos'
import SearchModal from './SearchModal'

/**
 * Site header — film-strip chrome.
 * Full-width placement (brand left, partners right) with larger logos/type.
 */
export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <header className="relative z-30 w-full overflow-visible bg-white">
        <div
          className="hidden h-8 sm:block sm:h-12 md:h-14 lg:h-16"
          aria-hidden="true"
        />

        <div className="relative overflow-visible">
          <HeaderStrip>
            {/* ——— Mobile ——— */}
            <div className="min-w-0 sm:hidden">
              <div className="flex max-w-full min-w-0 items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 flex-col">
                  <BrandLogo variant="mobile" />
                  <div className="mt-0 flex items-center gap-2">
                    <LanguageToggle variant="mobile" />
                    <MobileMenu
                      open={mobileOpen}
                      onOpen={() => setMobileOpen(true)}
                      onClose={() => setMobileOpen(false)}
                    />
                  </div>
                </div>
                <PartnerLogos variant="mobile" />
              </div>
            </div>

            {/* ——— Tablet / desktop ——— */}
            <div className="hidden min-w-0 sm:block">
              <div className="flex w-full max-w-full min-w-0 items-start gap-4 md:gap-6">
                <BrandLogo variant="desktop" />

                <div className="ml-auto flex min-w-0 shrink-0 items-center justify-end gap-3 pt-0.5 sm:gap-4 sm:pt-0 md:gap-5 lg:gap-6">
                  <AcademyLogo />
                  <StateLogo />
                  <LanguageToggle />
                </div>
              </div>

              <NavMenu onSearchOpen={() => setSearchOpen(true)} />
            </div>
          </HeaderStrip>
        </div>
      </header>

      <MobileBottomBar onSearchOpen={() => setSearchOpen(true)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
