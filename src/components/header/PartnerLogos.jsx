import KnockoutLogo from '../ui/KnockoutLogo'
import { LOGO_PATHS } from '../../data/menus'

/**
 * Academy + State Government partner marks.
 * Cap widths so iOS Safari doesn't size images by intrinsic canvas width
 * and shove them off the right edge of the header.
 */
export default function PartnerLogos({ variant = 'desktop', className = '' }) {
  if (variant === 'mobile') {
    return (
      <div
        className={`flex w-[46%] min-w-0 max-w-[12.5rem] shrink-0 flex-col items-end gap-0.5 ${className}`}
      >
        <KnockoutLogo
          src={LOGO_PATHS.state}
          alt="Government of Karnataka"
          className="h-[3.6rem] max-h-[3.6rem] w-auto max-w-[4rem]"
        />
        <KnockoutLogo
          src={LOGO_PATHS.academy}
          alt="Karnataka Chalanachitra Academy"
          className="h-[3.35rem] max-h-[3.35rem] w-auto max-w-full"
        />
      </div>
    )
  }

  return (
    <div
      className={`flex min-w-0 items-center justify-center gap-4 md:gap-6 ${className}`}
    >
      <KnockoutLogo
        src={LOGO_PATHS.academy}
        alt="Karnataka Chalanachitra Academy"
        className="h-9 max-h-9 w-auto max-w-[9rem] sm:h-11 sm:max-h-11 sm:max-w-[11rem] md:h-12 md:max-h-12 md:max-w-[12rem] lg:h-14 lg:max-h-14 lg:max-w-[14rem]"
      />
      <KnockoutLogo
        src={LOGO_PATHS.state}
        alt="Government of Karnataka"
        className="h-10 max-h-10 w-auto max-w-[5rem] sm:h-12 sm:max-h-12 sm:max-w-[6rem] md:h-14 md:max-h-14 md:max-w-[7rem] lg:h-16 lg:max-h-16 lg:max-w-[8rem]"
      />
    </div>
  )
}

export function AcademyLogo({ className = '' }) {
  return (
    <KnockoutLogo
      src={LOGO_PATHS.academy}
      alt="Karnataka Chalanachitra Academy"
      className={`-mt-1 h-11 max-h-11 w-auto max-w-[11rem] shrink sm:-mt-3 sm:h-[4.5rem] sm:max-h-[4.5rem] sm:max-w-[20rem] md:-mt-3.5 md:h-[5.5rem] md:max-h-[5.5rem] md:max-w-[24rem] lg:-mt-4 lg:h-[6.5rem] lg:max-h-[6.5rem] lg:max-w-[28rem] ${className}`}
    />
  )
}

export function StateLogo({ className = '' }) {
  return (
    <KnockoutLogo
      src={LOGO_PATHS.state}
      alt="Government of Karnataka"
      className={`h-12 max-h-12 w-auto max-w-[6rem] shrink sm:h-[4.25rem] sm:max-h-[4.25rem] sm:max-w-[9rem] md:h-[5rem] md:max-h-[5rem] md:max-w-[10.5rem] lg:h-[5.75rem] lg:max-h-[5.75rem] lg:max-w-[12rem] ${className}`}
    />
  )
}
